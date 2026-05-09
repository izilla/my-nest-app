/** biome-ignore-all lint/complexity/noExcessiveLinesPerFunction: specs are long */
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { TenantsModule } from '../src/tenants/tenants.module';

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

  const clearData = async () => {
    await prisma.tenant.deleteMany().catch(() => {
      // Ignore errors if the table is already empty
    });
    await prisma.user.deleteMany().catch(() => {
      // Ignore errors if the table is already empty
    });
    await prisma.tenantAdmin.deleteMany().catch(() => {
      // Ignore errors if the table is already empty
    });
  };

  afterEach(async () => {
    await clearData();
  });

  afterAll(async () => {
    await clearData();
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

  it('/tenants (POST)', () => {
    const newTenant = { name: 'Test Tenant', slug: 'TT101' };

    return request(app.getHttpServer())
      .post('/tenants')
      .send(newTenant)
      .expect(201)
      .expect(res => {
        expect(res.body).toEqual({
          id: expect.any(Number),
          ...newTenant,
          deletedAt: null,
        });
      });
  });

  it('/tenants/:id (DELETE)', async () => {
    // First, create a tenant to ensure there is one to delete
    const createdTenant = await prisma.tenant.create({
      data: { name: 'Tenant to Delete', slug: 'TD101' },
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
      data: { name: 'Tenant for User Assignment', slug: 'TUA101' },
    });
    const newUser = await prisma.user.create({
      data: { name: 'User for Tenant Assignment', email: 'tenantadmin@example.com' },
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
      data: { name: 'Tenant for Admin Assignment', slug: 'TAA102' },
    });
    const newUser = await prisma.user.create({
      data: { name: 'User for Admin Assignment', email: 'admin@example.com' },
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
