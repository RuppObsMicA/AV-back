import { ApiProperty } from '@nestjs/swagger';

export class RoleResponseDto {
    @ApiProperty({
        description: 'Role ID',
        example: 1
    })
    id: number;

    @ApiProperty({
        description: 'Role value/name',
        example: 'ADMIN'
    })
    value: string;

    @ApiProperty({
        description: 'Role description',
        example: 'Administrator with full system access'
    })
    description: string;

    @ApiProperty({
        description: 'Creation timestamp',
        example: '2026-01-06T10:00:00.000Z'
    })
    createdAt: Date;

    @ApiProperty({
        description: 'Last update timestamp',
        example: '2026-01-06T10:00:00.000Z'
    })
    updatedAt: Date;
}
