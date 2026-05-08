import { Test, TestingModule } from '@nestjs/testing';
import { TenantUncheckedCreateInput } from '../generated/prisma/models';
import { PrismaService } from '../prisma/prisma.service';
import { TenantService } from './tenant.service';

const mockTenant = {
  id: 1,
  slug: 'T1',
  name: 'Test Tenant',
  createdAt: new Date(),
  updatedAt: new Date(),
};

type MockPrismaService = {
  tenant: {
    findUnique: jest.MockedFunction<PrismaService['tenant']['findUnique']>;
    findMany: jest.MockedFunction<PrismaService['tenant']['findMany']>;
    create: jest.MockedFunction<PrismaService['tenant']['create']>;
    delete: jest.MockedFunction<PrismaService['tenant']['delete']>;
  };
};

const prismaMock: MockPrismaService = {
  tenant: {
    findUnique: jest.fn().mockResolvedValue(mockTenant),
    findMany: jest.fn().mockResolvedValue([mockTenant]),
    create: jest.fn(),
    delete: jest.fn(),
  },
};

describe('TenantService', () => {
  let tenantService: TenantService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TenantService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
      ],
    }).compile();

    tenantService = module.get<TenantService>(TenantService);
  });

  it('should be defined', () => {
    expect(tenantService).toBeDefined();
  });

  it('should return a single tenant', async () => {
    const result = await tenantService.tenant({ id: 1 });
    expect(result).toEqual(mockTenant);
    expect(prismaMock.tenant.findUnique).toHaveBeenCalledWith({ where: { id: 1 } });
  });

  it('should fetch a tenant list', async () => {
    prismaMock.tenant.findMany.mockResolvedValue([mockTenant]);

    const result = await tenantService.tenants({ take: 10, skip: 0 });
    expect(result).toEqual([mockTenant]);
    expect(prismaMock.tenant.findMany).toHaveBeenCalledWith({
      skip: 0,
      take: 10,
    });
  });

  it('should create a tenant', async () => {
    const payload: TenantUncheckedCreateInput = {
      slug: 'T2',
      name: 'New Tenant',
    };
    prismaMock.tenant.create.mockResolvedValue({ ...mockTenant, ...payload, id: 2 });

    const result = await tenantService.createTenant(payload);
    expect(result).toEqual({ ...mockTenant, ...payload, id: 2 });
    expect(prismaMock.tenant.create).toHaveBeenCalledWith({ data: payload });
  });

  it('should delete a tenant', async () => {
    prismaMock.tenant.delete.mockResolvedValue(mockTenant);

    const result = await tenantService.deleteTenant({ id: 1 });
    expect(result).toEqual(mockTenant);
    expect(prismaMock.tenant.delete).toHaveBeenCalledWith({ where: { id: 1 } });
  });
});
