import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length } from 'class-validator';

export class ResetPasswordRequestDto {
    @ApiProperty({ example: 'abc123xyz...', description: 'Password reset hash from email link' })
    @IsString({ message: 'Hash must be a string' })
    readonly hash: string;

    @ApiProperty({ example: 'MyNewPassword123', description: 'New password' })
    @IsString({ message: 'Password must be a string' })
    @Length(6, 16, { message: 'Password must be between 6 and 16 characters' })
    readonly password: string;
}
