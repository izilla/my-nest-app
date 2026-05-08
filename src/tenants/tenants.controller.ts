import { Body, Controller, Delete, Get, NotFoundException, Param, Patch, Post } from '@nestjs/common';
import { Tenant } from '../generated/prisma/browser';
import { TenantsService } from './tenants.service';

@Controller('tenants')
export class TenantsController {
  constructor(private readonly tenantService: TenantsService) {}

  @Get()
  getTenants(): Promise<Tenant[]> {
    return this.tenantService.tenants({});
  }

  @Get(':id')
  getTenant(@Param('id') id: string): Promise<Tenant | null> {
    return this.tenantService.tenant({ id: Number(id) });
  }

  @Post()
  createTenant(@Body() tenantData: { name: string; slug: string }): Promise<Tenant> {
    return this.tenantService.createTenant(tenantData);
  }

  @Patch(':id')
  async updateTenant(@Param('id') id: string, @Body() tenantData: { name?: string; slug?: string }): Promise<Tenant> {
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

  //XXX: This endpoint is for testing purposes only and should not be used in production. It deletes all tenants in the database.
  @Delete()
  async deleteTenants(): Promise<number> {
    const tenants = await this.tenantService.tenants({});
    return Promise.all(tenants.map(tenant => this.tenantService.deleteTenant({ id: tenant.id }))).then(
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
}
