/** biome-ignore-all lint/complexity/noExcessiveLinesPerFunction: tests are long lol */
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('PostsController (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prisma = moduleFixture.get<PrismaService>(PrismaService);
    await app.init();
  });

  afterEach(async () => {
    await prisma.post.deleteMany().catch(() => {
      // Ignore errors if the table is already empty
    });
  });

  afterAll(async () => {
    await app.close();
    await prisma.$disconnect();
  });

  describe('/posts (GET)', () => {
    it('should return an array of posts', () => {
      return request(app.getHttpServer())
        .get('/posts')
        .expect(200)
        .expect(res => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });
  });

  describe('/posts (POST)', () => {
    it('should create a new post', () => {
      const newPost = { title: 'Test Post', content: 'This is a test post.' };
      return request(app.getHttpServer())
        .post('/posts')
        .send(newPost)
        .expect(201)
        .expect(res => {
          expect(res.body).toMatchObject({
            id: expect.any(Number),
            ...newPost,
          });
        });
    });
  });

  describe('/posts/:id (PUT)', () => {
    it('should return a single post by ID', async () => {
      // First, create a post to ensure there is one to retrieve
      const createdPost = await prisma.post.create({
        data: { title: 'Another Test Post', content: 'This is another test post.' },
      });
      const postUpdates = { title: 'New Title', content: 'New content' };
      return request(app.getHttpServer())
        .put(`/posts/${createdPost.id}`)
        .send(postUpdates)
        .expect(200)
        .expect(res => {
          expect(res.body).toMatchObject({
            id: createdPost.id,
            title: postUpdates.title,
            content: postUpdates.content,
          });
        });
    });
  });

  describe('/posts/:id (DELETE)', () => {
    it('should delete a post by ID', async () => {
      // First, create a post to ensure there is one to delete
      const createdPost = await prisma.post.create({
        data: { title: 'Post to Delete', content: 'This post will be deleted.' },
      });

      await request(app.getHttpServer())
        .delete(`/posts/${createdPost.id}`)
        .expect(200)
        .expect(res => {
          expect(res.body).toEqual({
            ...createdPost,
            deletedAt: expect.any(String),
          });
        });

      return request(app.getHttpServer()).get(`/posts/${createdPost.id}`).expect(404);
    });
  });
});
