import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length } from 'class-validator';

export class ConfirmationRequestDto {
    @ApiProperty({ example: 'abc123xyz...', description: 'Confirmation hash from email link' })
    @IsString({ message: 'Hash must be a string' })
    readonly hash: string;

    @ApiProperty({ example: 'MySecurePassword123', description: 'User password' })
    @IsString({ message: 'Password must be a string' })
    @Length(6, 16, { message: 'Password must be between 6 and 16 characters' })
    readonly password: string;
}
