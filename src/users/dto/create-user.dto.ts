import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsEmail, Length } from 'class-validator';

export class CreateUserDto {
    @ApiProperty({ example: 'user@mail.com', description: 'Email' })
    @IsString({ message: 'Email must be a string' })
    @IsEmail({}, { message: 'Not email' })
    readonly email: string;

    @ApiProperty({ example: '123456', description: 'Password' })
    @IsString({ message: 'Password must be a string' })
    @Length(6, 16, { message: '4-16' })
    readonly password: string;
}