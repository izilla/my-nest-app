/** biome-ignore-all lint/complexity/noExcessiveLinesPerFunction: big service */
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Tenant } from '../generated/prisma/client';
import {
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
    const tenant = await this.prisma.client.tenant.findUnique({
      where: tenantWhereUniqueInput,
    });

    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    return this.prisma.client.tenant.findUnique({
      where: tenantWhereUniqueInput,
    });
  }

  async tenantsWithDeleted(params: {
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

  async createTenant(data: {
    name: string;
    slug: string;
    users: { email: string; name: string }[];
    tenantAdmins: { email: string; name: string }[];
  }): Promise<Tenant & { users: any[]; tenantAdmins: any[] }> {
    let generatedSlug = data.slug;
    if (!generatedSlug) {
      const count = await this.prisma.client.tenant
        .count({
          where: {
            name: {
              startsWith: data.name?.slice(0, 2).toUpperCase(),
            },
          },
        })
        .then(count => count + 1);
      generatedSlug = data.name?.slice(0, 2).toUpperCase() + count.toString().padStart(3, '0');
    }
    const existingTenant = await this.prisma.client.tenant.findUnique({
      where: { slug: generatedSlug },
    });

    if (existingTenant) {
      throw new BadRequestException('Tenant with this slug already exists');
    }

    if ((data.tenantAdmins || [])?.length === 0) {
      throw new BadRequestException('At least one tenant admin is required');
    }

    const existingAdminEmails = await this.prisma.client.user
      .findMany({
        where: {
          email: {
            in: data.tenantAdmins.map(admin => admin.email),
          },
        },
        select: {
          email: true,
        },
      })
      .then(users => users.map(user => user.email));

    if (existingAdminEmails.length > 0) {
      throw new BadRequestException(
        `The following tenant admin emails already exist: ${existingAdminEmails.join(', ')}`,
      );
    }

    const invalidAdminEmails = data.tenantAdmins
      .map(admin => admin.email)
      .filter(email => !/\S+@\S+\.\S+/.test(email) || existingAdminEmails.includes(email));

    if (invalidAdminEmails.length > 0) {
      throw new BadRequestException(`Invalid tenant admin emails: ${invalidAdminEmails.join(', ')}`);
    }

    const newTenant = await this.prisma.tenant.create({
      data: {
        name: data.name,
        slug: generatedSlug,
        users: {
          connectOrCreate: data.users?.map(user => ({
            where: { email: user.email },
            create: { email: user.email, name: user.name, emailVerified: false },
          })),
        },
      },
    });

    const createdTenantAdmins = await Promise.all(
      (data.tenantAdmins ?? []).map(admin =>
        this.prisma.tenantAdmin.create({
          data: {
            tenant: { connect: { id: newTenant.id } },
            user: {
              connectOrCreate: {
                where: { email: admin.email },
                create: {
                  email: admin.email,
                  name: admin.name,
                  emailVerified: false,
                  roles: ['TENANT_ADMIN'],
                  tenantId: newTenant.id,
                },
              },
            },
          },
        }),
      ),
    );

    await Promise.all(
      createdTenantAdmins.map(tenantAdmin =>
        this.prisma.user.update({
          where: { id: tenantAdmin.userId },
          data: {
            tenantId: newTenant.id,
            tenantAdminId: tenantAdmin.id,
            roles: { set: ['TENANT_ADMIN'] },
          },
        }),
      ),
    );

    const dbTenant = await this.prisma.client.tenant.findUnique({
      where: { id: newTenant.id },
      include: {
        users: true,
        tenantAdmins: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!dbTenant) {
      throw new NotFoundException('Tenant not found after creation');
    }

    return {
      ...dbTenant,
      users: dbTenant.users.filter(user => user.tenantAdminId === null),
    };
  }

  async updateTenant(params: { where: TenantWhereUniqueInput; data: TenantUpdateInput }): Promise<Tenant> {
    const { where, data } = params;
    return this.prisma.tenant.update({
      data,
      where,
    });
  }

  async deleteTenantHard(where: TenantWhereUniqueInput): Promise<Tenant> {
    const tenant = await this.prisma.tenant.findUnique({
      where,
    });

    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    const deletedTenant = (await this.prisma.tenant.delete({
      where,
    })) as Tenant;

    return deletedTenant;
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
    return this.prisma.tenantAdmin
      .create({
        data: {
          tenant: { connect: { id: tenantId } },
          user: { connect: { id: userId } },
        },
      })
      .tenant();
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
