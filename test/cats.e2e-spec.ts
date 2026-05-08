import { INestApplication } from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';
import request from 'supertest';
import type { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { CatsModule } from '../src/cats/cats.module';

describe('CatsController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule, CatsModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/cats (GET)', () => {
    return request(app.getHttpServer()).get('/cats').expect(200).expect('Welcome to the Cats API');
  });

  it('/cats/all (GET)', () => {
    return request(app.getHttpServer()).get('/cats/all').expect(200).expect([]);
  });

  it('/cats/new (PUT)', () => {
    const newCat = { name: 'Whiskers', age: 3, breed: 'Siamese' };
    return request(app.getHttpServer())
      .put('/cats/new')
      .send(newCat)
      .expect(200)
      .expect(res => {
        expect(res.body).toEqual({
          id: expect.any(String),
          ...newCat,
        });
      });
  });

  it('/cats/all (GET) after adding a cat', () => {
    const newCat = { name: 'Whiskers', age: 3, breed: 'Siamese' };
    return request(app.getHttpServer())
      .put('/cats/new')
      .send(newCat)
      .expect(200)
      .then(() => {
        return request(app.getHttpServer())
          .get('/cats/all')
          .expect(200)
          .expect(res => {
            expect(res.body).toEqual([
              {
                id: expect.any(String),
                ...newCat,
              },
            ]);
          });
      });
  });

  afterEach(async () => {
    await app.close();
  });
});
