/** biome-ignore-all lint/complexity/noExcessiveLinesPerFunction: specs are long */
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { TenantsModule } from '../src/tenants/tenants.module';
import { cleanTestData, uniqueEmail, uniqueName, uniqueSlug } from './e2e-utils';

describe('TenantsController (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule, TenantsModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prisma = moduleFixture.get<PrismaService>(PrismaService);
    await app.init();
  });

  afterEach(async () => {
    await cleanTestData(prisma);
  });

  afterAll(async () => {
    await cleanTestData(prisma);
    await app.close();
    await prisma.$disconnect();
  });

  it('/tenants (GET)', () => {
    return request(app.getHttpServer())
      .get('/tenants')
      .expect(200)
      .expect(data => {
        expect(Array.isArray(data.body)).toBe(true);
      });
  });

  describe('/tenants (POST)', () => {
    it('should create a tenant successfully with admin', async () => {
      const tenantAdminEmail = uniqueEmail('tenantadmin');
      const newTenant = {
        name: uniqueName('Test Tenant'),
        slug: uniqueSlug('TT101'),
        tenantAdmins: [{ email: tenantAdminEmail, name: 'Tenant Admin' }],
        users: [],
      };

      return request(app.getHttpServer())
        .post('/tenants')
        .send(newTenant)
        .expect(201)
        .expect(res => {
          expect(res.body).toEqual({
            id: expect.any(Number),
            ...newTenant,
            deletedAt: null,
            users: [],
            tenantAdmins: [
              {
                deletedAt: null,
                id: expect.any(Number),
                tenantId: expect.any(Number),
                user: {
                  deletedAt: null,
                  id: expect.any(Number),
                  passwordHash: null,
                  roles: ['TENANT_ADMIN'],
                  tenantAdminId: expect.any(Number),
                  tenantId: expect.any(Number),
                  email: tenantAdminEmail,
                  name: 'Tenant Admin',
                  emailVerified: false,
                },
                userId: expect.any(Number),
              },
            ],
          });
        });
    });

    it('should return 400 if required fields are missing', () => {
      return request(app.getHttpServer())
        .post('/tenants')
        .send({ name: 'Incomplete Tenant' }) // Missing slug and tenantAdmins
        .expect(400);
    });

    it('should create a unique slug if not provided', async () => {
      const newTenant = {
        name: uniqueName('Tenant Without Slug'),
        tenantAdmins: [{ email: uniqueEmail('admin'), name: 'Admin' }],
        users: [],
      };

      return request(app.getHttpServer())
        .post('/tenants')
        .send(newTenant)
        .expect(201)
        .expect(res => {
          expect(res.body.slug).toBeDefined();
          expect(res.body.slug).toMatch(/^[A-Z]{1,2}[a-z0-9]{3}$/); // Simple slug format check
        });
    });

    it('should return 400 if tenant with the same slug already exists', async () => {
      const slug = uniqueSlug('DUP101');
      await prisma.tenant.create({
        data: {
          name: uniqueName('Existing Tenant'),
          slug,
        },
      });

      const newTenant = {
        name: uniqueName('New Tenant With Duplicate Slug'),
        slug,
        tenantAdmins: [{ email: uniqueEmail('admin'), name: 'Admin' }],
        users: [],
      };

      return request(app.getHttpServer()).post('/tenants').send(newTenant).expect(400);
    });

    it('should return 400 if no tenant admin is provided', () => {
      const newTenant = {
        name: uniqueName('Tenant Without Admin'),
        slug: uniqueSlug('TWA101'),
      };

      return request(app.getHttpServer()).post('/tenants').send(newTenant).expect(400);
    });

    it('should return 400 if tenant admin email is invalid', () => {
      const newTenant = {
        name: uniqueName('Tenant With Invalid Admin Email'),
        slug: uniqueSlug('TIAE101'),
        tenantAdmins: [{ email: 'invalid-email', name: 'Admin' }],
        users: [],
      };

      return request(app.getHttpServer()).post('/tenants').send(newTenant).expect(400);
    });

    it('should return 400 if tenant admin email already exists', async () => {
      const existingEmail = uniqueEmail('existingadmin');
      await prisma.user.create({
        data: {
          name: uniqueName('Existing Admin'),
          email: existingEmail,
        },
      });

      const newTenant = {
        name: uniqueName('Tenant With Existing Admin Email'),
        slug: uniqueSlug('TE101'),
        tenantAdmins: [{ email: existingEmail, name: 'Admin' }],
        users: [],
      };

      return request(app.getHttpServer()).post('/tenants').send(newTenant).expect(400);
    });
  });

  it('/tenants/:id (DELETE)', async () => {
    // First, create a tenant to ensure there is one to delete
    const createdTenant = await prisma.tenant.create({
      data: { name: uniqueName('Tenant to Delete'), slug: uniqueSlug('TD101') },
    });

    return request(app.getHttpServer())
      .delete(`/tenants/${createdTenant.id}`)
      .expect(200)
      .expect(res => {
        expect(res.body).toEqual({
          id: createdTenant.id,
          name: createdTenant.name,
          slug: createdTenant.slug,
          deletedAt: expect.any(String),
        });
      });
  });

  it('/tenants/:id/assign-user (POST)', async () => {
    const newTenant = await prisma.tenant.create({
      data: { name: uniqueName('Tenant for User Assignment'), slug: uniqueSlug('TUA101') },
    });
    const newUser = await prisma.user.create({
      data: {
        name: uniqueName('User for Tenant Assignment'),
        email: uniqueEmail('tenantadmin'),
      },
    });

    return request(app.getHttpServer())
      .post(`/tenants/${newTenant.id}/assign-user`)
      .send({ userId: newUser.id })
      .expect(201)
      .expect(res => {
        expect(res.body).toEqual({
          id: newTenant.id,
          name: newTenant.name,
          slug: newTenant.slug,
          deletedAt: null,
        });
      });
  });

  it('/tenants/:id/assign-admin', async () => {
    const newTenant = await prisma.tenant.create({
      data: { name: uniqueName('Tenant for Admin Assignment'), slug: uniqueSlug('TAA102') },
    });
    const newUser = await prisma.user.create({
      data: {
        name: uniqueName('User for Admin Assignment'),
        email: uniqueEmail('admin'),
      },
    });

    return request(app.getHttpServer())
      .post(`/tenants/${newTenant.id}/assign-admin`)
      .send({ userId: newUser.id })
      .expect(201)
      .expect(res => {
        expect(res.body).toEqual({
          id: newTenant.id,
          name: newTenant.name,
          slug: newTenant.slug,
          deletedAt: null,
        });
      });
  });
});
