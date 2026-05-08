import { Controller, Get } from '@nestjs/common';
import { PostsService } from './posts.service';

@Controller()
export class UsersController {
  constructor(private readonly postsService: PostsService) {}

  @Get()
  getPosts(): string {
    return 'This will return all posts';
  }
}
