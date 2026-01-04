import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail } from 'class-validator';

export class ForgotPasswordRequestDto {
    @ApiProperty({ example: 'user@example.com', description: 'User email address' })
    @IsString({ message: 'Email must be a string' })
    @IsEmail({}, { message: 'Invalid email format' })
    readonly email: string;
}
