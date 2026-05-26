import { applyDecorators, UseGuards } from '@nestjs/common';
import { UserRole } from '../generated/prisma/enums';
import { AuthGuard } from './auth.guard';
import { Roles } from './roles.decorator';
import { RolesGuard } from './roles.guard';

export const AuthRoles = (...roles: UserRole[]) => applyDecorators(UseGuards(AuthGuard, RolesGuard), Roles(...roles));
