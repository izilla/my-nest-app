/** biome-ignore-all lint/complexity/noExcessiveLinesPerFunction: <explanation> */
import { Test, type TestingModule } from '@nestjs/testing';

jest.mock('../prisma/prisma.service', () => {
  class PrismaService {}
  return { PrismaService };
});

import { Post } from '../generated/prisma/client';
import { PostUncheckedCreateInput, PostUpdateInput } from '../generated/prisma/models';
import { PrismaService } from '../prisma/prisma.service';
import { PostsService } from './posts.service';

const mockPost: Post = {
  id: 1,
  title: 'Test post',
  content: 'This is a test',
  published: false,
  authorId: 1,
  deletedAt: null,
};

type MockPrismaService = {
  post: {
    findUnique: jest.MockedFunction<PrismaService['post']['findUnique']>;
    findMany: jest.MockedFunction<PrismaService['post']['findMany']>;
    create: jest.MockedFunction<PrismaService['post']['create']>;
    update: jest.MockedFunction<PrismaService['post']['update']>;
  };
  client: {
    post: {
      delete: jest.MockedFunction<PrismaService['post']['delete']>;
    };
  };
};

const prismaMock: MockPrismaService = {
  post: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  client: {
    post: {
      delete: jest.fn(),
    },
  },
};

describe('PostsService', () => {
  let service: PostsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PostsService, { provide: PrismaService, useValue: prismaMock as unknown as PrismaService }],
    }).compile();

    service = module.get<PostsService>(PostsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should fetch a single post', async () => {
    prismaMock.post.findUnique.mockResolvedValue(mockPost);

    const result = await service.post({ id: 1 });

    expect(result).toEqual(mockPost);
    expect(prismaMock.post.findUnique).toHaveBeenCalledWith({ where: { id: 1 } });
  });

  it('should fetch posts list', async () => {
    prismaMock.post.findMany.mockResolvedValue([mockPost]);

    const result = await service.posts({ take: 10, skip: 0 });

    expect(result).toEqual([mockPost]);
    expect(prismaMock.post.findMany).toHaveBeenCalledWith({
      skip: 0,
      take: 10,
      cursor: undefined,
      where: undefined,
      orderBy: undefined,
    });
  });

  it('should create a post', async () => {
    const payload: PostUncheckedCreateInput = { title: 'New post', content: 'Hello', published: true, authorId: 1 };
    prismaMock.post.create.mockResolvedValue({ ...mockPost, ...payload } as Post);

    const result = await service.createPost(payload);

    expect(result).toEqual({ ...mockPost, ...payload });
    expect(prismaMock.post.create).toHaveBeenCalledWith({ data: payload });
  });

  it('should update a post', async () => {
    const payload: PostUpdateInput = { title: 'Updated title' };
    prismaMock.post.update.mockResolvedValue({ ...mockPost, ...payload } as Post);

    const result = await service.updatePost({ where: { id: 1 }, data: payload });

    expect(result).toEqual({ ...mockPost, ...payload });
    expect(prismaMock.post.update).toHaveBeenCalledWith({ where: { id: 1 }, data: payload });
  });

  it('should delete a post', async () => {
    prismaMock.client.post.delete.mockResolvedValue(mockPost);

    const result = await service.deletePost({ id: 1 });

    expect(result).toEqual(mockPost);
    expect(prismaMock.client.post.delete).toHaveBeenCalledWith({ id: 1 });
  });
});
