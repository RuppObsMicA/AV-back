import { ApiProperty } from '@nestjs/swagger';

export class PostResponseDto {
    @ApiProperty()
    id: number;

    @ApiProperty()
    title: string;

    @ApiProperty()
    content: string;

    @ApiProperty({ nullable: true })
    imageUrl: string | null;

    @ApiProperty()
    authorId: number;

    @ApiProperty()
    createdAt: Date;

    @ApiProperty()
    updatedAt: Date;
}
