import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthTokenService } from './auth-token.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly authTokenService: AuthTokenService,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers?.authorization as string | undefined;

    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Authorization header missing or invalid');
    }

    const token = authHeader.slice(7).trim();
    const payload = this.authTokenService.verify(token);

    if (!payload?.sub) {
      throw new UnauthorizedException('Invalid token payload');
    }

    const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (user.deletedAt) {
      throw new UnauthorizedException('User account has been deleted');
    }

    if (!user.emailVerified) {
      throw new UnauthorizedException('Email address not verified');
    }

    request.user = user;
    return true;
  }
}
