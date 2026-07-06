/** biome-ignore-all lint/complexity/noExcessiveLinesPerFunction: specs are long */
import { Controller, Get, INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { UserRole } from '../generated/prisma/enums';
import { PrismaService } from '../prisma/prisma.service';
import { AuthGuard } from './auth.guard';
import { AuthRoles } from './auth-roles.decorator';
import { AuthTokenService } from './auth-token.service';
import { RolesGuard } from './roles.guard';

@Controller('test-auth')
class TestAuthController {
  @Get('therapist')
  @AuthRoles(UserRole.THERAPIST)
  getTherapist() {
    return { ok: true };
  }
}

describe('AuthRoles integration', () => {
  let app: INestApplication<App>;
  let authTokenService: AuthTokenService;
  let prismaMock: Partial<PrismaService>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [TestAuthController],
      providers: [
        AuthGuard,
        RolesGuard,
        AuthTokenService,
        {
          provide: ConfigService,
          useValue: { get: (k: string) => (k === 'AUTH_TOKEN_SECRET' ? 'test-secret' : '3600') },
        },
        {
          provide: PrismaService,
          useValue: {
            user: { findUnique: jest.fn() },
          },
        },
      ],
    }).compile();

    authTokenService = moduleFixture.get<AuthTokenService>(AuthTokenService);
    prismaMock = moduleFixture.get(PrismaService) as Partial<PrismaService>;

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('returns 401 when no token', () => {
    return request(app.getHttpServer()).get('/test-auth/therapist').expect(401);
  });

  it('returns 403 when user lacks role', async () => {
    const token = authTokenService.sign({ sub: 1 });
    (prismaMock.user!.findUnique as jest.Mock).mockResolvedValue({
      id: 1,
      roles: [UserRole.CLIENT],
      deletedAt: null,
      emailVerified: true,
    });

    await request(app.getHttpServer()).get('/test-auth/therapist').set('Authorization', `Bearer ${token}`).expect(403);
  });

  it('returns 200 when user has role', async () => {
    const token = authTokenService.sign({ sub: 2 });
    (prismaMock.user!.findUnique as jest.Mock).mockResolvedValue({
      id: 2,
      roles: [UserRole.THERAPIST],
      deletedAt: null,
      emailVerified: true,
    });

    await request(app.getHttpServer())
      .get('/test-auth/therapist')
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
      .expect(res => {
        expect(res.body).toEqual({ ok: true });
      });
  });
});
