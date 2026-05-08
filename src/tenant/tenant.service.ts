import { Injectable } from '@nestjs/common';
import { Tenant } from '../generated/prisma/client';
import {
  TenantOrderByWithRelationInput,
  TenantUpdateInput,
  TenantWhereInput,
  TenantWhereUniqueInput,
} from '../generated/prisma/models';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TenantService {
  constructor(private readonly prisma: PrismaService) {}

  async tenant(tenantWhereUniqueInput: TenantWhereUniqueInput): Promise<Tenant | null> {
    return this.prisma.tenant.findUnique({
      where: tenantWhereUniqueInput,
    });
  }

  async tenants(params: {
    skip?: number;
    take?: number;
    cursor?: TenantWhereUniqueInput;
    where?: TenantWhereInput;
    orderBy?: TenantOrderByWithRelationInput;
  }): Promise<Tenant[]> {
    const { skip, take, cursor, where, orderBy } = params;
    return this.prisma.tenant.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
    });
  }

  async createTenant(data): Promise<Tenant> {
    return this.prisma.tenant.create({ data });
  }

  async updateTenant(params: { where: TenantWhereUniqueInput; data: TenantUpdateInput }): Promise<Tenant> {
    const { where, data } = params;
    return this.prisma.tenant.update({
      data,
      where,
    });
  }

  async deleteTenant(where: TenantWhereUniqueInput): Promise<Tenant> {
    return this.prisma.tenant.delete({
      where,
    });
  }
}
