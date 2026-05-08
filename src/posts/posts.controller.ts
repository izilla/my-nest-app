import { Body, Controller, Delete, Get, NotFoundException, Param, Post, Put } from '@nestjs/common';
import { PostModel } from '../generated/prisma/models';
import { PostsService } from './posts.service';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Get()
  getPosts(): Promise<PostModel[]> {
    return this.postsService.posts({});
  }

  @Get(':id')
  async getPost(@Param('id') id: string): Promise<PostModel> {
    const post = await this.postsService.getPost({ id: Number(id) });
    if (!post) {
      throw new NotFoundException(`Post with id ${id} not found`);
    }
    return post;
  }

  @Post()
  createPost(@Body() post: Omit<PostModel, 'id'>): Promise<PostModel> {
    return this.postsService.createPost(post);
  }

  @Put(':id')
  updatePost(@Param('id') id: string, @Body() post: Omit<PostModel, 'id'>): Promise<PostModel> {
    const existingPost = this.postsService.getPost({ id: Number(id) });
    if (!existingPost) {
      throw new NotFoundException(`Post with id ${id} not found`);
    }
    return this.postsService.updatePost({
      where: { id: Number(id) },
      data: post,
    });
  }

  @Delete(':id')
  async softDeletePost(@Param('id') id: string): Promise<PostModel> {
    const existingPost = await this.postsService.getPost({ id: Number(id) });
    if (!existingPost) {
      throw new NotFoundException(`Post with id ${id} not found`);
    }
    return this.postsService.deletePost({ id: Number(id) });
  }
}
