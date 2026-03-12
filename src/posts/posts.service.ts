import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreatePostDto } from './dto/create-post.dto';
import { PostResponseDto } from './dto/post-response.dto';

@Injectable()
export class PostsService {
    constructor(private prisma: PrismaService) {}

    async create(dto: CreatePostDto, authorId: number, imageUrl?: string): Promise<PostResponseDto> {
        const post = await this.prisma.post.create({
            data: {
                title: dto.title,
                content: dto.content,
                imageUrl: imageUrl ?? null,
                authorId,
            },
        });
        return post;
    }

    async findAll(): Promise<PostResponseDto[]> {
        return this.prisma.post.findMany({
            orderBy: { createdAt: 'desc' },
        });
    }

    async findOne(id: number): Promise<PostResponseDto> {
        const post = await this.prisma.post.findUnique({ where: { id } });

        if (!post) {
            throw new NotFoundException(`Post with id ${id} not found`);
        }

        return post;
    }

    async remove(id: number): Promise<{ message: string }> {
        await this.findOne(id);

        await this.prisma.post.delete({ where: { id } });

        return { message: `Post ${id} deleted successfully` };
    }
}
