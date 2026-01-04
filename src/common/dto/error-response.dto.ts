import { ApiProperty } from '@nestjs/swagger';

export class ErrorResponseDto {
    @ApiProperty({ example: 400, description: 'HTTP status code' })
    statusCode: number;

    @ApiProperty({ example: 'Email exists', description: 'Error message' })
    message: string;
}
