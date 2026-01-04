import { ApiProperty } from "@nestjs/swagger";
import { BelongsToMany, Column, DataType, Model, Table } from "sequelize-typescript";
import { Role } from "src/roles/roles.model";
import { UserRoles } from "src/roles/user-roles.model";

interface UserCreationAttrs {
    email: string;
    password?: string | null; // Now optional - can be null when pending
    confirmationHash?: string | null;
    confirmationExpires?: Date | null;
    status?: 'pending' | 'active' | 'banned';
}

@Table({tableName: 'users', timestamps: true, paranoid: true})
export class User extends Model<User, UserCreationAttrs> {
    @ApiProperty({example: '1', description: 'Unique identifier'})
    @Column({type: DataType.INTEGER, unique: true, autoIncrement: true, primaryKey: true})
    declare id: number;

    @ApiProperty({example: 'user@mail.com', description: 'Email'})
    @Column({type: DataType.STRING, unique: true, allowNull: false})
    declare email: string;

    @ApiProperty({example: '123456', description: 'Password'})
    @Column({type: DataType.STRING, allowNull: true})
    declare password: string | null;

    @ApiProperty({example: 'email', description: 'Authentication provider'})
    @Column({type: DataType.STRING, defaultValue: 'email'})
    declare provider: string;

    @ApiProperty({example: null, description: 'Social media ID for OAuth'})
    @Column({type: DataType.STRING, allowNull: true})
    declare socialId: string | null;

    @ApiProperty({example: 'John', description: 'First name'})
    @Column({type: DataType.STRING, allowNull: true})
    declare firstName: string | null;

    @ApiProperty({example: 'Doe', description: 'Last name'})
    @Column({type: DataType.STRING, allowNull: true})
    declare lastName: string | null;

    @ApiProperty({example: null, description: 'New email for verification'})
    @Column({type: DataType.STRING, allowNull: true})
    declare newEmail: string | null;

    @ApiProperty({example: '1990-01-01', description: 'Date of birth'})
    @Column({type: DataType.DATEONLY, allowNull: true})
    declare dateBirth: Date | null;

    @ApiProperty({example: 'true', description: 'Is banned'})
    @Column({type: DataType.BOOLEAN, defaultValue: false})
    declare banned: boolean;

    @ApiProperty({example: 'Rude', description: 'Reason for ban'})
    @Column({type: DataType.STRING, allowNull: true})
    declare banReason: string | null;

    @ApiProperty({example: false, description: 'Is two-factor authentication enabled'})
    @Column({type: DataType.BOOLEAN, defaultValue: false})
    declare isTwoFAEnabled: boolean;

    @ApiProperty({example: null, description: 'Confirmation hash for email verification'})
    @Column({type: DataType.STRING, allowNull: true, unique: true})
    declare confirmationHash: string | null;

    @ApiProperty({example: null, description: 'Confirmation hash expiration date'})
    @Column({type: DataType.DATE, allowNull: true})
    declare confirmationExpires: Date | null;

    @ApiProperty({example: 'pending', description: 'User account status'})
    @Column({type: DataType.ENUM('pending', 'active', 'banned'), defaultValue: 'pending'})
    declare status: 'pending' | 'active' | 'banned';

    @ApiProperty({example: null, description: 'Directory ID'})
    @Column({type: DataType.INTEGER, allowNull: true})
    declare directoryId: number | null;

    @ApiProperty({example: null, description: 'Organization ID'})
    @Column({type: DataType.INTEGER, allowNull: true})
    declare organizationId: number | null;

    @ApiProperty({example: null, description: 'Photo/Avatar ID'})
    @Column({type: DataType.STRING, allowNull: true})
    declare photoId: string | null;

    @ApiProperty({example: null, description: 'Input language ID'})
    @Column({type: DataType.INTEGER, allowNull: true})
    declare inputLanguageId: number | null;

    @ApiProperty({example: null, description: 'Output language ID'})
    @Column({type: DataType.INTEGER, allowNull: true})
    declare outputLanguageId: number | null;

    @ApiProperty({example: null, description: 'Department ID'})
    @Column({type: DataType.INTEGER, allowNull: true})
    declare departmentId: number | null;

    @ApiProperty({example: null, description: 'Status ID'})
    @Column({type: DataType.INTEGER, allowNull: true})
    declare statusId: number | null;

    @ApiProperty({example: null, description: 'Subscribe plan ID'})
    @Column({type: DataType.INTEGER, allowNull: true})
    declare subscribePlanId: number | null;

    @BelongsToMany(() => Role, () => UserRoles)
    declare roles: Role[];

    // Virtual field for full name
    get title(): string {
        if (this.firstName && this.lastName) {
            return `${this.firstName} ${this.lastName}`;
        }
        return this.email;
    }
}