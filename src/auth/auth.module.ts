import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '../prisma/prisma.module';
import { SecurityService } from '../security/security.service';
import { UsersService } from '../users/users.service';
import { AuthController } from './auth.controller';
import { AuthGuard } from './auth.guard';
import { AuthService } from './auth.service';
import { AuthTokenService } from './auth-token.service';
import { PermissionsGuard } from './permissions.guard';
import { RolesGuard } from './roles.guard';

@Module({
  imports: [PrismaModule, ConfigModule],
  controllers: [AuthController],
  providers: [AuthService, AuthTokenService, AuthGuard, RolesGuard, PermissionsGuard, UsersService, SecurityService],
  exports: [AuthGuard, RolesGuard, PermissionsGuard, AuthTokenService],
})
export class AuthModule {}
