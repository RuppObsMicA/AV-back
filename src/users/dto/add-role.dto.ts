import { IsNumber, IsString } from "class-validator";

export class AddRoleDto {
    @IsString({message: 'Not string'})
    readonly value: string;
    @IsNumber({}, {message: 'Not number'})
    readonly userId: number;
}