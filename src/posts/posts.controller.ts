import {
    BadRequestException,
    Body,
    Controller,
    Delete,
    Get,
    Param,
    ParseIntPipe,
    Post,
    Req,
    UploadedFile,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { CreatePostDto } from './dto/create-post.dto';
import { PostResponseDto } from './dto/post-response.dto';
import { PostsService } from './posts.service';

@ApiTags('posts')
@Controller('posts')
export class PostsController {
    constructor(private postsService: PostsService) {}

    @Post()
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Create a new post with optional image upload' })
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                title: { type: 'string' },
                content: { type: 'string' },
                image: { type: 'string', format: 'binary' },
            },
        },
    })
    @UseInterceptors(
        FileInterceptor('image', {
            storage: diskStorage({
                destination: './uploads',
                filename: (_req, file, callback) => {
                    const uniqueName = `${Date.now()}${extname(file.originalname)}`;
                    callback(null, uniqueName);
                },
            }),
            fileFilter: (_req, file, callback) => {
                if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
                    return callback(
                        new BadRequestException('Only image files are allowed (jpg, jpeg, png, gif, webp)'),
                        false,
                    );
                }
                callback(null, true);
            },
        }),
    )
    async create(
        @Body() dto: CreatePostDto,
        @Req() req: any,
        @UploadedFile() file?: Express.Multer.File,
    ): Promise<PostResponseDto> {
        const imageUrl = file ? `/uploads/${file.filename}` : undefined;
        return this.postsService.create(dto, req.user.id, imageUrl);
    }

    @Get()
    @ApiOperation({ summary: 'Get all posts' })
    async findAll(): Promise<PostResponseDto[]> {
        return this.postsService.findAll();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get a single post by id' })
    async findOne(@Param('id', ParseIntPipe) id: number): Promise<PostResponseDto> {
        return this.postsService.findOne(id);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Delete a post by id' })
    async remove(@Param('id', ParseIntPipe) id: number): Promise<{ message: string }> {
        return this.postsService.remove(id);
    }
}
