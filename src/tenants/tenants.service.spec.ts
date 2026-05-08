/** biome-ignore-all lint/complexity/noExcessiveLinesPerFunction: specs should be long */
import { Test, TestingModule } from '@nestjs/testing';
import { TenantModel, TenantUncheckedCreateInput } from '../generated/prisma/models';
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
  client: {
    tenant: {
      findUnique: jest.MockedFunction<PrismaService['client']['tenant']['findUnique']>;
      findMany: jest.MockedFunction<PrismaService['client']['tenant']['findMany']>;
      delete: jest.MockedFunction<PrismaService['client']['tenant']['delete']>;
    };
    user: {
      findUnique: jest.MockedFunction<PrismaService['client']['user']['findUnique']>;
    };
  };
};

const prismaMock: MockPrismaService = {
  tenant: {
    create: jest.fn(),
    update: jest.fn().mockResolvedValue(mockTenant),
  },
  client: {
    tenant: {
      findUnique: jest.fn().mockResolvedValue(mockTenant),
      findMany: jest.fn().mockResolvedValue([mockTenant]),
      delete: jest.fn(),
    },
    user: {
      findUnique: jest.fn().mockResolvedValue({ id: 1, name: 'Test User', email: 'test@example.com' }),
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
    const payload: TenantUncheckedCreateInput = {
      slug: 'T2',
      name: 'New Tenant',
    };
    prismaMock.tenant.create.mockResolvedValue({ ...mockTenant, ...payload, id: 2 } as TenantModel);

    const result = await tenantService.createTenant(payload);
    expect(result).toEqual({ ...mockTenant, ...payload, id: 2 });
    expect(prismaMock.tenant.create).toHaveBeenCalledWith({ data: payload });
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
