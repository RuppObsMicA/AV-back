import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length } from 'class-validator';

export class CreateRoleDto {
    @ApiProperty({
        description: 'Role value (unique identifier)',
        example: 'ADMIN',
        minLength: 2,
        maxLength: 50
    })
    @IsString({ message: 'Must be a string' })
    @Length(2, 50, { message: 'Role value must be between 2 and 50 characters' })
    readonly value: string;

    @ApiProperty({
        description: 'Role description',
        example: 'Administrator with full access',
        minLength: 5,
        maxLength: 200
    })
    @IsString({ message: 'Must be a string' })
    @Length(5, 200, { message: 'Description must be between 5 and 200 characters' })
    readonly description: string;
}