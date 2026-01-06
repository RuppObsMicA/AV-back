import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcryptjs';
import { UserSerializer } from 'src/users/serializers/user.serializer';
import { LoginResponseDto } from './dto/login-response.dto';
import { RegistrationResponseDto } from './dto/registration-response.dto';
import { RegistrationRequestDto } from './dto/registration-request.dto';
import { ConfirmationRequestDto } from './dto/confirmation-request.dto';
import { ForgotPasswordRequestDto } from './dto/forgot-password-request.dto';
import { ResetPasswordRequestDto } from './dto/reset-password-request.dto';
import { ForgotPasswordResponseDto } from './dto/forgot-password-response.dto';
import { MailService } from 'src/mail/mail.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { randomBytes } from 'crypto';

// Type for User with roles included
type UserWithRoles = {
    id: number;
    email: string;
    password: string | null;
    status: string;
    roles: Array<{
        role: {
            id: number;
            value: string;
        };
    }>;
};

@Injectable()
export class AuthService {
    constructor(
        private userService: UsersService,
        private jwtService: JwtService,
        private mailService: MailService,
        private prisma: PrismaService
    ) {}

    async login(userDto: CreateUserDto): Promise<LoginResponseDto> {
        console.log('=== LOGIN ATTEMPT ===');
        console.log('Email:', userDto.email);
        console.log('Password length:', userDto.password?.length);

        const user = await this.validateUser(userDto);
        return this.generateToken(user);
    }

    async registration(userDto: CreateUserDto): Promise<RegistrationResponseDto> {
        const hashPassword = await bcrypt.hash(userDto.password, 5);
        const user = await this.userService.createUser({ ...userDto, password: hashPassword });

        return {
            message: 'User successfully created',
            email: user.email
        };
    }

    private async generateToken(user: UserWithRoles): Promise<LoginResponseDto> {
        const sessionId = Math.floor(Math.random() * 1000000);

        console.log('=== DEBUG: generateToken ===');
        console.log('User ID:', user.id);
        console.log('User roles:', user.roles);
        console.log('First role:', user.roles?.[0]);

        const tokenPayload = {
            id: user.id,
            role: user.roles?.[0]?.role?.value || null,
            sessionId,
            isTwoFAAuthenticated: false
        };

        console.log('Token payload:', tokenPayload);

        const refreshTokenPayload = { sessionId };

        const token = this.jwtService.sign(tokenPayload, { expiresIn: '3h' });
        const refreshToken = this.jwtService.sign(refreshTokenPayload, { expiresIn: '30d' });
        const tokenExpires = Date.now() + 3 * 60 * 60 * 1000;

        const response = {
            refreshToken,
            token,
            tokenExpires,
            user: UserSerializer.toResponse(user as any)
        };

        console.log('Login response user:', response.user);
        return response;
    }

    private async validateUser(userDto: CreateUserDto): Promise<UserWithRoles> {
        const user = await this.userService.getUserByEmail(userDto.email) as any;

        if (!user) {
            throw new UnauthorizedException({ message: 'Invalid email or password' });
        }

        console.log('=== DEBUG: User loaded ===');
        console.log('Email:', user.email);
        console.log('Roles array:', user.roles);

        if (user.status !== 'active') {
            throw new UnauthorizedException({ message: 'Please confirm your email first' });
        }

        if (!user.password) {
            console.log('❌ Password not set for user');
            throw new UnauthorizedException({ message: 'Please set your password first' });
        }

        console.log('Comparing passwords...');
        const passwordEquals = await bcrypt.compare(userDto.password, user.password);
        console.log('Password match result:', passwordEquals);

        if (passwordEquals) {
            console.log('✅ Password matches!');
            return user;
        }

        console.log('❌ Password does not match!');
        throw new UnauthorizedException({ message: 'Invalid email or password' });
    }

    async startRegistration(dto: RegistrationRequestDto): Promise<RegistrationResponseDto> {
        const existingUser = await this.userService.getUserByEmail(dto.email);

        if (existingUser) {
            if (existingUser.status === 'active') {
                throw new BadRequestException('Email already registered');
            }

            // Update pending user
            const confirmationHash = randomBytes(32).toString('hex');
            const confirmationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

            await this.prisma.user.update({
                where: { id: existingUser.id },
                data: {
                    confirmationHash,
                    confirmationExpires
                }
            });

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

        console.log('Created pending user:', { id: createdUser.id, email: createdUser.email });
        await this.mailService.sendConfirmationEmail(dto.email, confirmationHash);

        return {
            message: 'Confirmation email sent. Please check your inbox.',
            email: dto.email,
        };
    }

    async confirmRegistration(dto: ConfirmationRequestDto): Promise<RegistrationResponseDto> {
        console.log('Confirming registration with DTO:', dto);
        const user = await this.userService.getUserByConfirmationHash(dto.hash);

        if (!user) {
            throw new BadRequestException('Invalid confirmation link');
        }

        if (user.confirmationExpires && user.confirmationExpires < new Date()) {
            throw new BadRequestException('Confirmation link expired');
        }

        const hashedPassword = await bcrypt.hash(dto.password, 5);

        await this.prisma.user.update({
            where: { id: user.id },
            data: {
                password: hashedPassword,
                status: 'active',
                confirmationHash: null,
                confirmationExpires: null
            }
        });

        return {
            message: 'Password set successfully. You can now login.',
            email: user.email,
        };
    }

    async forgotPassword(dto: ForgotPasswordRequestDto): Promise<ForgotPasswordResponseDto> {
        const user = await this.userService.getUserByEmail(dto.email);

        if (!user) {
            return {
                message: 'If the email exists, a password reset link has been sent.',
                email: dto.email,
            };
        }

        if (user.status !== 'active') {
            return {
                message: 'If the email exists, a password reset link has been sent.',
                email: dto.email,
            };
        }

        const resetHash = randomBytes(32).toString('hex');
        const resetExpires = new Date(Date.now() + 1 * 60 * 60 * 1000);

        await this.prisma.user.update({
            where: { id: user.id },
            data: {
                confirmationHash: resetHash,
                confirmationExpires: resetExpires
            }
        });

        await this.mailService.sendPasswordResetEmail(dto.email, resetHash);

        return {
            message: 'If the email exists, a password reset link has been sent.',
            email: dto.email,
        };
    }

    async resetPassword(dto: ResetPasswordRequestDto): Promise<ForgotPasswordResponseDto> {
        const user = await this.userService.getUserByConfirmationHash(dto.hash);

        if (!user) {
            throw new BadRequestException('Invalid or expired reset link');
        }

        if (user.confirmationExpires && user.confirmationExpires < new Date()) {
            throw new BadRequestException('Reset link expired');
        }

        if (user.status !== 'active') {
            throw new BadRequestException('Cannot reset password for inactive account');
        }

        const hashedPassword = await bcrypt.hash(dto.password, 5);

        await this.prisma.user.update({
            where: { id: user.id },
            data: {
                password: hashedPassword,
                confirmationHash: null,
                confirmationExpires: null
            }
        });

        return {
            message: 'Password has been reset successfully. You can now login.',
            email: user.email,
        };
    }
}
