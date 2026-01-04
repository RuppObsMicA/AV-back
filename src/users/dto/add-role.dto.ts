import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsString } from "class-validator";

export class AddRoleDto {
    @ApiProperty({ example: 'ADMIN', description: 'Role value' })
    @IsString({message: 'Not string'})
    readonly value: string;
    @ApiProperty({ example: 1, description: 'User ID' })
    @IsNumber({}, {message: 'Not number'})
    readonly userId: number;
}