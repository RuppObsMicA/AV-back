import { ApiProperty } from '@nestjs/swagger';

export class RegistrationResponseDto {
    @ApiProperty({
        example: 'Confirmation email sent. Please check your inbox.',
        description: 'Success message'
    })
    message: string;

    @ApiProperty({
        example: 'user@example.com',
        description: 'Registered email'
    })
    email: string;
}
