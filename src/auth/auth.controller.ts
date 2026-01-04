import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { AuthService } from './auth.service';
import { LoginResponseDto } from './dto/login-response.dto';
import { RegistrationResponseDto } from './dto/registration-response.dto';
import { ErrorResponseDto, ValidationErrorResponseDto } from '../common/dto';
import { RegistrationRequestDto } from './dto/registration-request.dto';
import { ConfirmationRequestDto } from './dto/confirmation-request.dto';
import { ForgotPasswordRequestDto } from './dto/forgot-password-request.dto';
import { ResetPasswordRequestDto } from './dto/reset-password-request.dto';
import { ForgotPasswordResponseDto } from './dto/forgot-password-response.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {

    constructor(private authService: AuthService) {

    }


    @ApiOperation({ summary: 'User login', description: 'Authenticate user with email and password' })
    @ApiResponse({ status: 200, description: 'Successful login', type: LoginResponseDto })
    @ApiResponse({ status: 400, description: 'Validation failed (invalid email format, password too short)', type: ValidationErrorResponseDto })
    @ApiResponse({ status: 401, description: 'Invalid email or password', type: ErrorResponseDto })
    @HttpCode(HttpStatus.OK)
    @Post('/email/login')
    login(@Body() userDto: CreateUserDto) {
        return  this.authService.login(userDto);
    }

    @ApiOperation({ summary: 'Start registration', description: 'Send confirmation email to user' })
    @ApiResponse({ status: 201, description: 'Confirmation email sent', type: RegistrationResponseDto })
    @ApiResponse({ status: 400, description: 'Email already registered', type: ErrorResponseDto })
    @ApiResponse({ status: 400, description: 'Validation failed (invalid email format)', type: ValidationErrorResponseDto })
    @Post('/email/register')
    register(@Body() dto: RegistrationRequestDto) {
        return this.authService.startRegistration(dto);
    }

    @ApiOperation({ summary: 'Confirm registration', description: 'Set password and activate account' })
    @ApiResponse({ status: 200, description: 'Password set successfully', type: RegistrationResponseDto })
    @ApiResponse({ status: 400, description: 'Invalid or expired link OR validation failed', type: ErrorResponseDto })
    @ApiResponse({ status: 400, description: 'Validation failed (password too short)', type: ValidationErrorResponseDto })
    @Post('/email/confirm')
    confirm(@Body() dto: ConfirmationRequestDto) {
        return this.authService.confirmRegistration(dto);
    }

    @ApiOperation({ summary: 'Request password reset', description: 'Send password reset email to user' })
    @ApiResponse({ status: 200, description: 'Password reset email sent (if email exists)', type: ForgotPasswordResponseDto })
    @ApiResponse({ status: 400, description: 'Validation failed (invalid email format)', type: ValidationErrorResponseDto })
    @Post('/forgot/password')
    forgotPassword(@Body() dto: ForgotPasswordRequestDto) {
        return this.authService.forgotPassword(dto);
    }

    @ApiOperation({ summary: 'Reset password', description: 'Set new password using reset link' })
    @ApiResponse({ status: 200, description: 'Password reset successfully', type: ForgotPasswordResponseDto })
    @ApiResponse({ status: 400, description: 'Invalid or expired reset link', type: ErrorResponseDto })
    @ApiResponse({ status: 400, description: 'Validation failed (password too short)', type: ValidationErrorResponseDto })
    @Post('/reset/password')
    resetPassword(@Body() dto: ResetPasswordRequestDto) {
        return this.authService.resetPassword(dto);
    }

}
