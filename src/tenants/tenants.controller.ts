import { Body, Controller, Delete, Get, NotFoundException, Param, Patch, Post, Res } from '@nestjs/common';
import { AuthTokenService } from '../auth/auth-token.service';
import { Tenant } from '../generated/prisma/browser';
import { TenantsService } from './tenants.service';

@Controller('tenants')
export class TenantsController {
  constructor(
    private readonly tenantService: TenantsService,
    private readonly authTokenService: AuthTokenService,
  ) {}

  @Get()
  getTenants(): Promise<Tenant[]> {
    return this.tenantService.tenants({});
  }

  @Get(':id')
  getTenant(@Param('id') id: string): Promise<Tenant | null> {
    return this.tenantService.tenant({ id: Number(id) });
  }

  @Post()
  async createTenant(
    @Body() tenantData: {
      name: string;
      slug?: string;
      users: { email: string; name: string }[];
      tenantAdmins: { email: string; name: string }[];
    },
    // biome-ignore lint/suspicious/noExplicitAny: NestJS Response object
    @Res() res: any,
  ): Promise<void> {
    const newTenant = await this.tenantService.createTenant(tenantData);

    // Get the first tenant admin user to generate auth token
    // biome-ignore lint/suspicious/noExplicitAny: tenantAdmins structure from service includes user data
    const tenantAdmin = newTenant.tenantAdmins?.[0] as any;
    if (tenantAdmin?.user?.id) {
      const authToken = this.authTokenService.sign({
        sub: tenantAdmin.user.id,
        roles: tenantAdmin.user.roles,
        tenantId: String(newTenant.id),
        isTenantAdmin: true,
      });

      // Set auth token as secure httpOnly cookie
      res.cookie('auth_token', authToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
      });
    }

    res.status(201).json(newTenant);
  }

  @Patch(':id')
  async updateTenant(@Param('id') id: string, @Body() tenantData: { name?: string; slug?: string }): Promise<Tenant> {
    console.log('Updating tenant with ID:', id, 'and data:', tenantData);
    const tenant = await this.tenantService.tenant({ id: Number(id) });

    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    return this.tenantService.updateTenant({
      where: { id: Number(id) },
      data: tenantData,
    });
  }

  @Delete(':id')
  async deleteTenant(@Param('id') id: string): Promise<Tenant> {
    const tenant = await this.tenantService.tenant({ id: Number(id) });

    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    return this.tenantService.deleteTenant({ id: Number(id) });
  }

  @Delete(':id/hard')
  async hardDeleteTenant(@Param('id') id: string): Promise<Tenant> {
    const tenant = await this.tenantService.tenant({ id: Number(id) });

    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    return this.tenantService.deleteTenantHard({ id: Number(id) });
  }

  //XXX: This endpoint is for testing purposes only and should not be used in production. It deletes all tenants in the database.
  @Delete()
  async deleteTenants(): Promise<number> {
    const tenants = await this.tenantService.tenantsWithDeleted({});
    return Promise.all(tenants.map(tenant => this.tenantService.deleteTenantHard({ id: tenant.id }))).then(
      deletedTenants => deletedTenants.length,
    );
  }

  @Post(':id/assign-user')
  async assignUserToTenant(@Param('id') id: string, @Body() data: { userId: number }): Promise<Tenant> {
    const tenant = await this.tenantService.tenant({ id: Number(id) });

    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    return this.tenantService.assignUserToTenant({ tenantId: Number(id), userId: data.userId });
  }

  @Post(':id/assign-admin')
  async assignAdminToTenant(@Param('id') id: string, @Body() data: { userId: number }): Promise<Tenant> {
    const tenant = await this.tenantService.tenant({ id: Number(id) });

    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    return this.tenantService.assignAdminToTenant({ tenantId: Number(id), userId: data.userId });
  }
}
