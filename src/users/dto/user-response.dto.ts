import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Exclude, Expose, Type } from 'class-transformer';
import { RoleResponseDto } from 'src/roles/dto/role-response.dto';

export class UserResponseDto {
    @ApiProperty({
        description: 'User ID',
        example: 1
    })
    @Expose()
    id: number;

    @ApiProperty({
        description: 'User email address',
        example: 'user@example.com'
    })
    @Expose()
    email: string;

    @ApiProperty({
        description: 'Authentication provider',
        example: 'email',
        default: 'email'
    })
    @Expose()
    provider: string;

    @ApiPropertyOptional({
        description: 'Social media ID if using social login',
        example: '1234567890'
    })
    @Expose()
    socialId?: string;

    @ApiPropertyOptional({
        description: 'User first name',
        example: 'John'
    })
    @Expose()
    firstName?: string;

    @ApiPropertyOptional({
        description: 'User last name',
        example: 'Doe'
    })
    @Expose()
    lastName?: string;

    @ApiPropertyOptional({
        description: 'User date of birth',
        example: '1990-01-01'
    })
    @Expose()
    dateBirth?: Date;

    @ApiProperty({
        description: 'Account status',
        example: 'active',
        enum: ['pending', 'active', 'banned']
    })
    @Expose()
    status: string;

    @ApiProperty({
        description: 'Whether account is banned',
        example: false
    })
    @Expose()
    banned: boolean;

    @ApiPropertyOptional({
        description: 'Reason for ban if account is banned',
        example: 'Violation of terms of service'
    })
    @Expose()
    banReason?: string;

    @ApiProperty({
        description: 'Whether two-factor authentication is enabled',
        example: false
    })
    @Expose()
    isTwoFAEnabled: boolean;

    @ApiPropertyOptional({
        description: 'User primary role',
        type: RoleResponseDto
    })
    @Expose()
    @Type(() => RoleResponseDto)
    role?: RoleResponseDto;

    @ApiProperty({
        description: 'Account creation timestamp',
        example: '2026-01-06T10:00:00.000Z'
    })
    @Expose()
    createdAt: Date;

    @ApiProperty({
        description: 'Last update timestamp',
        example: '2026-01-06T10:00:00.000Z'
    })
    @Expose()
    updatedAt: Date;

    @ApiPropertyOptional({
        description: 'User display title (full name or email)',
        example: 'John Doe'
    })
    @Expose()
    title?: string;

    // Fields that should never be exposed in API responses
    @Exclude()
    password: string;

    @Exclude()
    confirmationHash?: string;

    @Exclude()
    confirmationExpires?: Date;

    @Exclude()
    newEmail?: string;

    @Exclude()
    deletedAt?: Date;
}
