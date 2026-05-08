import { Controller, Get, Param } from '@nestjs/common';
import { Tenant } from '../generated/prisma/browser';
import { TenantService } from './tenant.service';

@Controller('tenant')
export class TenantController {
  constructor(private readonly tenantService: TenantService) {}

  @Get()
  getTenant(@Param('id') id: string): Promise<Tenant | null> {
    return this.tenantService.tenant({ id: Number(id) });
  }
}
