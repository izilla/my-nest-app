/** biome-ignore-all lint/complexity/noExcessiveLinesPerFunction: specs are long */
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
    create: jest.MockedFunction<PrismaService['post']['create']>;
    update: jest.MockedFunction<PrismaService['post']['update']>;
  };
  client: {
    post: {
      findUnique: jest.MockedFunction<PrismaService['client']['post']['findUnique']>;
      findMany: jest.MockedFunction<PrismaService['client']['post']['findMany']>;
      update: jest.MockedFunction<PrismaService['client']['post']['update']>;
    };
  };
};

const prismaMock: MockPrismaService = {
  post: {
    create: jest.fn(),
    update: jest.fn(),
  },
  client: {
    post: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
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
    prismaMock.client.post.findUnique.mockResolvedValue(mockPost);

    const result = await service.getPost({ id: 1 });

    expect(result).toEqual(mockPost);
    expect(prismaMock.client.post.findUnique).toHaveBeenCalledWith({ where: { id: 1 } });
  });

  it('should fetch posts list', async () => {
    prismaMock.client.post.findMany.mockResolvedValue([mockPost]);

    const result = await service.posts({ take: 10, skip: 0 });

    expect(result).toEqual([mockPost]);
    expect(prismaMock.client.post.findMany).toHaveBeenCalledWith({
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
    const deletedPost = { ...mockPost, deletedAt: new Date() };
    prismaMock.client.post.update.mockResolvedValue(deletedPost);

    const result = await service.deletePost({ id: 1 });

    expect(result).toEqual(deletedPost);
    expect(prismaMock.client.post.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { deletedAt: expect.any(Date) },
    });
  });
});
