/** biome-ignore-all lint/complexity/noExcessiveLinesPerFunction: specs should be long */
import { Test, TestingModule } from '@nestjs/testing';
import { TenantModel } from '../generated/prisma/models';
import { PrismaService } from '../prisma/prisma.service';
import { TenantsService } from './tenants.service';

const mockTenant = {
  id: 1,
  slug: 'T1',
  name: 'Test Tenant',
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
};

type MockPrismaService = {
  tenant: {
    create: jest.MockedFunction<PrismaService['tenant']['create']>;
    update: jest.MockedFunction<PrismaService['tenant']['update']>;
  };
  tenantAdmin: {
    create: jest.MockedFunction<PrismaService['tenantAdmin']['create']>;
  };
  user: {
    update: jest.MockedFunction<PrismaService['user']['update']>;
  };
  client: {
    tenant: {
      findUnique: jest.MockedFunction<PrismaService['client']['tenant']['findUnique']>;
      findMany: jest.MockedFunction<PrismaService['client']['tenant']['findMany']>;
      count: jest.MockedFunction<PrismaService['client']['tenant']['count']>;
      delete: jest.MockedFunction<PrismaService['client']['tenant']['delete']>;
    };
    user: {
      findUnique: jest.MockedFunction<PrismaService['client']['user']['findUnique']>;
      findMany: jest.MockedFunction<PrismaService['client']['user']['findMany']>;
    };
  };
};

const prismaMock: MockPrismaService = {
  tenant: {
    create: jest.fn(),
    update: jest.fn().mockResolvedValue(mockTenant),
  },
  tenantAdmin: {
    create: jest.fn(),
  },
  user: {
    update: jest.fn(),
  },
  client: {
    tenant: {
      findUnique: jest.fn().mockResolvedValue(mockTenant),
      findMany: jest.fn().mockResolvedValue([mockTenant]),
      count: jest.fn().mockResolvedValue(0),
      delete: jest.fn(),
    },
    user: {
      findUnique: jest.fn().mockResolvedValue({ id: 1, name: 'Test User', email: 'test@example.com' }),
      findMany: jest.fn().mockResolvedValue([]),
    },
  },
};

describe('TenantsService', () => {
  let tenantService: TenantsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TenantsService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
      ],
    }).compile();

    tenantService = module.get<TenantsService>(TenantsService);
  });

  it('should be defined', () => {
    expect(tenantService).toBeDefined();
  });

  it('should return a single tenant', async () => {
    const result = await tenantService.tenant({ id: 1 });
    expect(result).toEqual(mockTenant);
    expect(prismaMock.client.tenant.findUnique).toHaveBeenCalledWith({ where: { id: 1 } });
  });

  it('should fetch a tenant list', async () => {
    prismaMock.client.tenant.findMany.mockResolvedValue([mockTenant]);

    const result = await tenantService.tenants({ take: 10, skip: 0 });
    expect(result).toEqual([mockTenant]);
    expect(prismaMock.client.tenant.findMany).toHaveBeenCalledWith({
      skip: 0,
      take: 10,
    });
  });

  it('should create a tenant', async () => {
    const payload = {
      slug: 'T2',
      name: 'New Tenant',
      users: [{ email: 'user@example.com', name: 'User Name' }],
      tenantAdmins: [{ email: 'admin@example.com', name: 'Admin Name' }],
    };

    prismaMock.client.tenant.findUnique.mockResolvedValueOnce(null);
    prismaMock.tenant.create.mockResolvedValue({ ...mockTenant, ...payload, id: 2 } as TenantModel);
    prismaMock.tenantAdmin.create.mockResolvedValue({
      id: 10,
      tenantId: 2,
      userId: 20,
      deletedAt: null,
    });
    prismaMock.user.update.mockResolvedValue({
      id: 20,
      email: 'admin@example.com',
      name: 'Admin Name',
      tenantId: 2,
      tenantAdminId: 10,
      roles: ['TENANT_ADMIN'],
      deletedAt: null,
      passwordHash: null,
      emailVerified: false,
    });
    prismaMock.client.tenant.findUnique.mockResolvedValueOnce({
      ...mockTenant,
      ...payload,
      id: 2,
      users: [],
      tenantAdmins: [
        {
          id: 10,
          tenantId: 2,
          userId: 20,
          deletedAt: null,
          user: {
            id: 20,
            email: 'admin@example.com',
            name: 'Admin Name',
            tenantId: 2,
            tenantAdminId: 10,
            roles: ['TENANT_ADMIN'],
            deletedAt: null,
            passwordHash: null,
            emailVerified: false,
          },
        },
      ],
    } as TenantModel);

    const result = await tenantService.createTenant(payload as any);

    expect(result).toEqual({
      ...mockTenant,
      ...payload,
      id: 2,
      users: [],
      tenantAdmins: [
        {
          id: 10,
          tenantId: 2,
          userId: 20,
          deletedAt: null,
          user: {
            id: 20,
            email: 'admin@example.com',
            name: 'Admin Name',
            tenantId: 2,
            tenantAdminId: 10,
            roles: ['TENANT_ADMIN'],
            deletedAt: null,
            passwordHash: null,
            emailVerified: false,
          },
        },
      ],
    });
    expect(prismaMock.tenant.create).toHaveBeenCalledWith({
      data: {
        name: payload.name,
        slug: payload.slug,
        users: {
          connectOrCreate: [
            {
              where: { email: 'user@example.com' },
              create: { email: 'user@example.com', name: 'User Name', emailVerified: false },
            },
          ],
        },
      },
    });
    expect(prismaMock.tenantAdmin.create).toHaveBeenCalledWith({
      data: {
        tenant: { connect: { id: 2 } },
        user: {
          connectOrCreate: {
            where: { email: 'admin@example.com' },
            create: {
              email: 'admin@example.com',
              name: 'Admin Name',
              emailVerified: false,
              roles: ['TENANT_ADMIN'],
              tenantId: 2,
            },
          },
        },
      },
    });
    expect(prismaMock.user.update).toHaveBeenCalledWith({
      where: { id: 20 },
      data: {
        tenantId: 2,
        tenantAdminId: 10,
        roles: { set: ['TENANT_ADMIN'] },
      },
    });
    expect(prismaMock.client.tenant.findUnique).toHaveBeenCalledWith({
      where: { id: 2 },
      include: {
        users: true,
        tenantAdmins: {
          include: {
            user: true,
          },
        },
      },
    });
  });

  it('should generate a slug when slug is missing', async () => {
    const payload = {
      name: 'example tenant',
      users: [],
      tenantAdmins: [{ email: 'admin@example.com', name: 'Admin Name' }],
    };

    prismaMock.client.tenant.count.mockResolvedValueOnce(1);
    prismaMock.client.tenant.findUnique.mockResolvedValueOnce(null);
    prismaMock.tenant.create.mockResolvedValue({
      ...mockTenant,
      ...payload,
      id: 2,
      slug: 'EX002',
    } as TenantModel);
    prismaMock.tenantAdmin.create.mockResolvedValue({
      id: 10,
      tenantId: 2,
      userId: 20,
      deletedAt: null,
    });
    prismaMock.user.update.mockResolvedValue({
      id: 20,
      email: 'admin@example.com',
      name: 'Admin Name',
      tenantId: 2,
      tenantAdminId: 10,
      roles: ['TENANT_ADMIN'],
      deletedAt: null,
      passwordHash: null,
      emailVerified: false,
    });
    prismaMock.client.tenant.findUnique.mockResolvedValueOnce({
      ...mockTenant,
      ...payload,
      id: 2,
      slug: 'EX002',
      users: [],
      tenantAdmins: [
        {
          id: 10,
          tenantId: 2,
          userId: 20,
          deletedAt: null,
          user: {
            id: 20,
            email: 'admin@example.com',
            name: 'Admin Name',
            tenantId: 2,
            tenantAdminId: 10,
            roles: ['TENANT_ADMIN'],
            deletedAt: null,
            passwordHash: null,
            emailVerified: false,
          },
        },
      ],
    } as TenantModel);

    const result = await tenantService.createTenant(payload as any);

    expect(result).toBeTruthy();
    expect(prismaMock.client.tenant.count).toHaveBeenCalledWith({
      where: {
        slug: {
          startsWith: 'EX',
        },
      },
    });
    expect(prismaMock.tenant.create).toHaveBeenCalledWith({
      data: {
        name: payload.name,
        slug: 'EX002',
        users: {
          connectOrCreate: [],
        },
      },
    });
    expect(result.slug).toBe('EX002');
  });

  it('should delete a tenant', async () => {
    prismaMock.client.tenant.delete.mockResolvedValue(mockTenant);

    const result = await tenantService.deleteTenant({ id: 1 });
    expect(result).toEqual(mockTenant);
    expect(prismaMock.client.tenant.delete).toHaveBeenCalledWith({ id: 1 });
  });

  it('should assign a user to a tenant', async () => {
    const result = await tenantService.assignUserToTenant({ tenantId: 1, userId: 1 });
    expect(result).toEqual(mockTenant);
    expect(prismaMock.client.tenant.findUnique).toHaveBeenCalledWith({ where: { id: 1 } });
    expect(prismaMock.client.user.findUnique).toHaveBeenCalledWith({ where: { id: 1 } });
    expect(prismaMock.tenant.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: {
        users: {
          connect: { id: 1 },
        },
      },
    });
    expect(prismaMock.client.tenant.findUnique).toHaveBeenCalledWith({ where: { id: 1 } });
  });
});
