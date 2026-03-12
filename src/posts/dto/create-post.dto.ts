import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreatePostDto {
    @ApiProperty({ example: 'My first post', description: 'Post title' })
    @IsString()
    @IsNotEmpty()
    readonly title: string;

    @ApiProperty({ example: 'This is the post content...', description: 'Post content' })
    @IsString()
    @MinLength(10)
    readonly content: string;
}
