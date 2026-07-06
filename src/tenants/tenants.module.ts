import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { PrismaModule } from '../prisma/prisma.module';
import { SecurityModule } from '../security/security.module';
import { UsersService } from '../users/users.service';
import { TenantsController } from './tenants.controller';
import { TenantsService } from './tenants.service';

@Module({
  imports: [PrismaModule, SecurityModule, AuthModule],
  controllers: [TenantsController],
  providers: [TenantsService, UsersService],
})
export class TenantsModule {}
