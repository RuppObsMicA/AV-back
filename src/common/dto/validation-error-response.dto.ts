import { ApiProperty } from '@nestjs/swagger';

class ValidationError {
    @ApiProperty({ example: 'email', description: 'Field that failed validation' })
    property: string;

    @ApiProperty({
        example: { isEmail: 'Not email' },
        description: 'Validation constraints that failed'
    })
    constraints: Record<string, string>;
}

export class ValidationErrorResponseDto {
    @ApiProperty({ example: 400, description: 'HTTP status code' })
    statusCode: number;

    @ApiProperty({
        example: 'Validation failed',
        description: 'Error message'
    })
    message: string;

    @ApiProperty({
        type: [ValidationError],
        description: 'Array of validation errors',
        example: [
            {
                property: 'email',
                constraints: { isEmail: 'Not email' }
            },
            {
                property: 'password',
                constraints: { length: '4-16' }
            }
        ]
    })
    errors: ValidationError[];
}
