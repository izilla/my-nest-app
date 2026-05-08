import { Injectable, NotFoundException } from '@nestjs/common';
import { Tenant } from '../generated/prisma/client';
import {
  TenantCreateInput,
  TenantOrderByWithRelationInput,
  TenantUpdateInput,
  TenantWhereInput,
  TenantWhereUniqueInput,
} from '../generated/prisma/models';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TenantsService {
  constructor(private readonly prisma: PrismaService) {}

  async tenant(tenantWhereUniqueInput: TenantWhereUniqueInput): Promise<Tenant | null> {
    return this.prisma.client.tenant.findUnique({
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
    return this.prisma.client.tenant.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
    });
  }

  async createTenant(data: TenantCreateInput): Promise<Tenant> {
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
    const tenant = await this.prisma.client.tenant.findUnique({
      where,
    });

    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    const deletedTenant = (await this.prisma.client.tenant.delete({
      ...where,
    })) as Tenant;

    return deletedTenant;
  }

  async assignAdminToTenant(params: { tenantId: number; userId: number }): Promise<Tenant> {
    const { tenantId, userId } = params;

    // Check if tenant exists
    const tenant = await this.prisma.client.tenant.findUnique({
      where: { id: tenantId },
    });

    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    // Check if user exists
    const user = await this.prisma.client.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Assign user as admin to tenant
    return this.prisma.tenant.update({
      where: { id: tenantId },
      data: {
        admins: {
          connect: { id: userId },
        },
      },
    });
  }

  async assignUserToTenant(params: { tenantId: number; userId: number }): Promise<Tenant> {
    const { tenantId, userId } = params;

    // Check if tenant exists
    const tenant = await this.prisma.client.tenant.findUnique({
      where: { id: tenantId },
    });

    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    // Check if user exists
    const user = await this.prisma.client.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Assign user to tenant
    return this.prisma.tenant.update({
      where: { id: tenantId },
      data: {
        users: {
          connect: { id: userId },
        },
      },
    });
  }
}
