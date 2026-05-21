/** biome-ignore-all lint/complexity/noExcessiveLinesPerFunction: tests are long */
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { SecurityService } from '../src/security/security.service';
import { authEmail, authPassword, cleanTestData, uniqueEmail, uniqueName } from './e2e-utils';

describe('UsersController (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let securityService: SecurityService;
  let authToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
      providers: [SecurityService],
    }).compile();

    app = moduleFixture.createNestApplication();
    prisma = moduleFixture.get<PrismaService>(PrismaService);
    securityService = moduleFixture.get<SecurityService>(SecurityService);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    // Create an authenticated user for protected endpoints
    const passwordHash = await securityService.hash(authPassword);
    await prisma.user.create({
      data: {
        email: authEmail(),
        name: uniqueName('Auth User'),
        passwordHash,
        emailVerified: true,
      },
    });

    // Sign in to get auth token
    const signInResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: authEmail(), pass: authPassword });

    authToken = signInResponse.body.accessToken;
  });

  afterEach(async () => {
    await cleanTestData(prisma);
  });

  describe('/users (GET)', () => {
    it('should return an array of users', () => {
      return request(app.getHttpServer())
        .get('/users')
        .expect(200)
        .expect(res => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });
  });

  describe('/users/:id (GET)', () => {
    it('should return a single user by ID', async () => {
      // First, create a user to ensure there is one to retrieve
      const createdUser = await prisma.user.create({
        data: { name: uniqueName('Test User'), email: uniqueEmail('test') },
      });
      return request(app.getHttpServer())
        .get(`/users/${createdUser.id}`)
        .expect(200)
        .expect(res => {
          expect(res.body).toMatchObject({
            id: createdUser.id,
            name: createdUser.name,
            email: createdUser.email,
          });
        });
    });
  });

  describe('/users (POST)', () => {
    it('should create a new user', () => {
      const newUser = { name: uniqueName('New User'), email: uniqueEmail('newuser') };
      return request(app.getHttpServer())
        .post('/users')
        .send(newUser)
        .expect(201)
        .expect(res => {
          expect(res.body).toMatchObject({
            id: expect.any(Number),
            ...newUser,
          });
        });
    });
  });

  describe('/users/:id/hard (DELETE)', () => {
    it('should delete a user by ID', async () => {
      // First, create a user to ensure there is one to delete
      const createdUser = await prisma.user.create({
        data: { name: uniqueName('Delete User'), email: uniqueEmail('deleteuser') },
      });

      await request(app.getHttpServer())
        .delete(`/users/${createdUser.id}/hard`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect(res => {
          expect(res.body).toMatchObject({
            id: createdUser.id,
            name: createdUser.name,
            email: createdUser.email,
          });
        });

      return request(app.getHttpServer()).get(`/users/${createdUser.id}`).expect(404);
    });
  });

  describe('/users/:id (DELETE)', () => {
    it('should soft delete a user by ID', async () => {
      // First, create a user to ensure there is one to delete
      const createdUser = await prisma.user.create({
        data: {
          name: uniqueName('Soft Delete User'),
          email: uniqueEmail('softdeleteduser'),
        },
      });

      await request(app.getHttpServer())
        .delete(`/users/${createdUser.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect(res => {
          expect(res.body).toMatchObject({
            ...createdUser,
            deletedAt: expect.any(String),
          });
        });

      return request(app.getHttpServer()).get(`/users/${createdUser.id}`).expect(404);
    });
  });

  describe('/users (PATCH)', () => {
    it('should update a user by ID', async () => {
      // First, create a user to ensure there is one to update
      const createdUser = await prisma.user.create({
        data: { name: uniqueName('Update User'), email: uniqueEmail('updateuser') },
      });

      const updatedData = {
        id: createdUser.id,
        name: uniqueName('Updated User Name'),
        email: uniqueEmail('updateduser'),
      };

      await request(app.getHttpServer())
        .patch(`/users/${createdUser.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updatedData)
        .expect(200)
        .expect(res => {
          expect(res.body).toMatchObject({
            ...createdUser,
            ...updatedData,
          });
        });
    });
  });
});
