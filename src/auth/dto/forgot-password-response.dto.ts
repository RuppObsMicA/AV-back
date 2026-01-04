import { ApiProperty } from '@nestjs/swagger';

export class ForgotPasswordResponseDto {
    @ApiProperty({
        example: 'Password reset email sent. Please check your inbox.',
        description: 'Success message'
    })
    message: string;

    @ApiProperty({
        example: 'user@example.com',
        description: 'Email where reset link was sent'
    })
    email: string;
}
