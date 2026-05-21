import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '../prisma/prisma.module';
import { SecurityService } from '../security/security.service';
import { UsersService } from '../users/users.service';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthTokenService } from './auth-token.service';
import { AuthGuard } from './auth.guard';

@Module({
  imports: [PrismaModule, ConfigModule],
  controllers: [AuthController],
  providers: [AuthService, AuthTokenService, AuthGuard, UsersService, SecurityService],
  exports: [AuthGuard, AuthTokenService],
})
export class AuthModule {}
