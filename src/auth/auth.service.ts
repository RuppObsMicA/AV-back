import { HttpException, HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcryptjs';
import { User } from 'src/users/users.model';
import { UserSerializer } from 'src/users/serializers/user.serializer';
import { LoginResponseDto } from './dto/login-response.dto';
import { RegistrationResponseDto } from './dto/registration-response.dto';
import { RegistrationRequestDto } from './dto/registration-request.dto';
import { ConfirmationRequestDto } from './dto/confirmation-request.dto';
import { ForgotPasswordRequestDto } from './dto/forgot-password-request.dto';
import { ResetPasswordRequestDto } from './dto/reset-password-request.dto';
import { ForgotPasswordResponseDto } from './dto/forgot-password-response.dto';
import { MailService } from 'src/mail/mail.service';
import { randomBytes } from 'crypto';

@Injectable()
export class AuthService {

    constructor(
        private userService: UsersService,
        private jwtService: JwtService,
        private mailService: MailService
    ) {}

    async login(userDto: CreateUserDto) {
        console.log('=== LOGIN ATTEMPT ===');
        console.log('Email:', userDto.email);
        console.log('Password length:', userDto.password?.length);

        const user = await this.validateUser(userDto);

        return this.generateToken(user);
    }

    async registration(userDto: CreateUserDto): Promise<RegistrationResponseDto> {
        const hashPassword = await bcrypt.hash(userDto.password, 5);

        const user = await this.userService.createUser({ ...userDto, password: hashPassword })

        return {
            message: 'User successfully created',
            email: user.email
        };
    }

    private async generateToken(user: User): Promise<LoginResponseDto> {
        const sessionId = Math.floor(Math.random() * 1000000);

        // DEBUG: Check roles before creating token
        console.log('=== DEBUG: generateToken ===');
        console.log('User ID:', user.id);
        console.log('User roles:', user.roles);
        console.log('First role object:', user.roles?.[0]);
        console.log('Role value:', user.roles?.[0]?.value);

        const tokenPayload = {
            id: user.id,
            role: user.roles?.[0]?.value || null, // Important: take value, not entire Role object!
            sessionId,
            isTwoFAAuthenticated: false
        };

        console.log('Token payload:', tokenPayload);

        const refreshTokenPayload = {
            sessionId
        };

        const token = this.jwtService.sign(tokenPayload, { expiresIn: '3h' });
        const refreshToken = this.jwtService.sign(refreshTokenPayload, { expiresIn: '30d' });

        const tokenExpires = Date.now() + 3 * 60 * 60 * 1000;

        const response = {
            refreshToken,
            token,
            tokenExpires,
            user: UserSerializer.toResponse(user)
        };

        console.log('Login response user:', response.user);

        return response;
    }

    private async validateUser(userDto: CreateUserDto) {
        const user = await this.userService.getUserByEmail(userDto.email);

        if (!user) {
            throw new UnauthorizedException({ message: 'Invalid email or password' })
        }

        // DEBUG: Check if roles are loaded
        console.log('=== DEBUG: User loaded ===');
        console.log('Email:', user.email);
        console.log('Roles array:', user.roles);
        console.log('Roles length:', user.roles?.length);
        console.log('First role:', user.roles?.[0]);

        // Check: user must be active
        if (user.status !== 'active') {
            throw new UnauthorizedException({ message: 'Please confirm your email first' });
        }

        // Check: password must be set
        if (!user.password) {
            console.log('❌ Password not set for user');
            throw new UnauthorizedException({ message: 'Please set your password first' });
        }

        console.log('Comparing passwords...');
        console.log('Incoming password:', userDto.password);
        console.log('Stored hash (first 20 chars):', user.password.substring(0, 20));

        const passwordEquals = await bcrypt.compare(userDto.password, user.password);

        console.log('Password match result:', passwordEquals);

        if (passwordEquals) {
            console.log('✅ Password matches! Returning user with roles');
            return user; // Return entire object with loaded relations (roles)
        }

        console.log('❌ Password does not match!');
        throw new UnauthorizedException({ message: 'Invalid email or password' })
    }

    // 1. Start registration (send email)
    async startRegistration(dto: RegistrationRequestDto): Promise<RegistrationResponseDto> {
        // Check if user with this email already exists
        const existingUser = await this.userService.getUserByEmail(dto.email);

        if (existingUser) {
            // If there's an active user - error
            if (existingUser.status === 'active') {
                throw new HttpException('Email already registered', HttpStatus.BAD_REQUEST);
            }

            // If there's a pending user - update hash and send new email
            const confirmationHash = randomBytes(32).toString('hex');
            const confirmationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

            existingUser.confirmationHash = confirmationHash;
            existingUser.confirmationExpires = confirmationExpires;
            await existingUser.save();

            await this.mailService.sendConfirmationEmail(dto.email, confirmationHash);

            return {
                message: 'Confirmation email sent. Please check your inbox.',
                email: dto.email,
            };
        }

        // Create new pending user
        const confirmationHash = randomBytes(32).toString('hex');
        const confirmationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

        const createdUser = await this.userService.createPendingUser({
            email: dto.email,
            confirmationHash,
            confirmationExpires,
        });

        console.log('Created pending user:', { id: createdUser.id, email: createdUser.email, hash: confirmationHash });

        await this.mailService.sendConfirmationEmail(dto.email, confirmationHash);

        return {
            message: 'Confirmation email sent. Please check your inbox.',
            email: dto.email,
        };
    }

    // 2. Confirm registration (set password)
    async confirmRegistration(dto: ConfirmationRequestDto) {
        console.log('Confirming registration with DTO:', dto);
        const user = await this.userService.getUserByConfirmationHash(dto.hash);

        if (!user) {
            throw new HttpException('Invalid confirmation link', HttpStatus.BAD_REQUEST);
        }

        // Check expiration
        if (user.confirmationExpires && user.confirmationExpires < new Date()) {
            throw new HttpException('Confirmation link expired', HttpStatus.BAD_REQUEST);
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(dto.password, 5);

        // Update user
        user.password = hashedPassword;
        user.status = 'active';
        user.confirmationHash = null;
        user.confirmationExpires = null;
        await user.save();

        // DO NOT generate tokens! User should login themselves
        return {
            message: 'Password set successfully. You can now login.',
            email: user.email,
        };
    }

    // 3. Start password recovery (send email)
    async forgotPassword(dto: ForgotPasswordRequestDto): Promise<ForgotPasswordResponseDto> {
        // Find user by email
        const user = await this.userService.getUserByEmail(dto.email);

        // If user not found, DO NOT reveal this (security best practice)
        // Just return successful response
        if (!user) {
            return {
                message: 'If the email exists, a password reset link has been sent.',
                email: dto.email,
            };
        }

        // Check that user is active
        if (user.status !== 'active') {
            // For inactive users, also don't reveal information
            return {
                message: 'If the email exists, a password reset link has been sent.',
                email: dto.email,
            };
        }

        // Generate hash for password reset
        const resetHash = randomBytes(32).toString('hex');
        const resetExpires = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1 hour (shorter than registration!)

        // Save hash in confirmationHash field (reuse)
        user.confirmationHash = resetHash;
        user.confirmationExpires = resetExpires;
        await user.save();

        // Send email with reset link
        await this.mailService.sendPasswordResetEmail(dto.email, resetHash);

        return {
            message: 'If the email exists, a password reset link has been sent.',
            email: dto.email,
        };
    }

    // 4. Confirm password reset (set new password)
    async resetPassword(dto: ResetPasswordRequestDto): Promise<ForgotPasswordResponseDto> {
        // Find user by hash
        const user = await this.userService.getUserByConfirmationHash(dto.hash);

        if (!user) {
            throw new HttpException('Invalid or expired reset link', HttpStatus.BAD_REQUEST);
        }

        // Check expiration
        if (user.confirmationExpires && user.confirmationExpires < new Date()) {
            throw new HttpException('Reset link expired', HttpStatus.BAD_REQUEST);
        }

        // Check that user is active
        if (user.status !== 'active') {
            throw new HttpException('Cannot reset password for inactive account', HttpStatus.BAD_REQUEST);
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(dto.password, 5);

        // Update password and clear hash
        user.password = hashedPassword;
        user.confirmationHash = null;
        user.confirmationExpires = null;
        await user.save();

        return {
            message: 'Password has been reset successfully. You can now login.',
            email: user.email,
        };
    }
}
