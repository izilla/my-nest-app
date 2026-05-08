import { Injectable } from '@nestjs/common';
import { Post } from '../generated/prisma/client';
import {
  PostOrderByWithRelationInput,
  PostUncheckedCreateInput,
  PostUpdateInput,
  PostWhereInput,
  PostWhereUniqueInput,
} from '../generated/prisma/models';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PostsService {
  constructor(private prisma: PrismaService) {}

  async post(postWhereUniqueInput: PostWhereUniqueInput): Promise<Post | null> {
    return this.prisma.post.findUnique({
      where: postWhereUniqueInput,
    });
  }

  async posts(params: {
    skip?: number;
    take?: number;
    cursor?: PostWhereUniqueInput;
    where?: PostWhereInput;
    orderBy?: PostOrderByWithRelationInput;
  }): Promise<Post[]> {
    const { skip, take, cursor, where, orderBy } = params;
    return this.prisma.post.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
    });
  }

  async createPost(params: PostUncheckedCreateInput): Promise<Post> {
    return this.prisma.post.create({
      data: params,
    });
  }

  async updatePost(params: { where: PostWhereUniqueInput; data: PostUpdateInput }): Promise<Post> {
    return this.prisma.post.update({
      where: params.where,
      data: params.data,
    });
  }

  async deletePost(where: PostWhereUniqueInput): Promise<Post> {
    return this.prisma.post.delete({
      where,
    });
  }
}
