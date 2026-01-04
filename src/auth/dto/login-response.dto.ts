import { ApiProperty } from '@nestjs/swagger';

export class LoginResponseDto {
    @ApiProperty({ description: 'Refresh token' })
    refreshToken: string;

    @ApiProperty({ description: 'Access token' })
    token: string;

    @ApiProperty({ description: 'Token expiration timestamp' })
    tokenExpires: number;

    @ApiProperty({ description: 'User data' })
    user: any;
}
