/** biome-ignore-all lint/complexity/noExcessiveLinesPerFunction: <explanation> */
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthGuard } from './auth.guard';
import { AuthTokenService } from './auth-token.service';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let authTokenService: Partial<AuthTokenService>;
  let prisma: Partial<PrismaService>;

  beforeEach(() => {
    authTokenService = {
      verify: jest.fn(),
    } as Partial<AuthTokenService>;

    prisma = {
      user: {
        findUnique: jest.fn(),
      } as Partial<PrismaService['user']>,
    } as Partial<PrismaService>;

    guard = new AuthGuard(authTokenService as AuthTokenService, prisma as PrismaService);
  });

  const makeCtx = (headers: Record<string, string>) =>
    ({
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({ headers }),
      }),
    }) as unknown as ExecutionContext;

  it('throws when Authorization header missing', async () => {
    const ctx = makeCtx({});
    await expect(guard.canActivate(ctx)).rejects.toThrow(UnauthorizedException);
  });

  it('throws when token verify fails', async () => {
    (authTokenService.verify as jest.Mock).mockImplementation(() => {
      throw new UnauthorizedException('bad token');
    });

    const ctx = makeCtx({ authorization: 'Bearer invalid' });
    await expect(guard.canActivate(ctx)).rejects.toThrow(UnauthorizedException);
  });

  it('throws when payload missing sub', async () => {
    (authTokenService.verify as jest.Mock).mockReturnValue({});
    const ctx = makeCtx({ authorization: 'Bearer token' });
    await expect(guard.canActivate(ctx)).rejects.toThrow(UnauthorizedException);
  });

  it('throws when user not found', async () => {
    (authTokenService.verify as jest.Mock).mockReturnValue({ sub: 1 });
    (prisma.user!.findUnique as jest.Mock).mockResolvedValue(null);

    const ctx = makeCtx({ authorization: 'Bearer token' });
    await expect(guard.canActivate(ctx)).rejects.toThrow(UnauthorizedException);
  });

  it('throws when user deleted or not verified', async () => {
    (authTokenService.verify as jest.Mock).mockReturnValue({ sub: 1 });
    (prisma.user!.findUnique as jest.Mock).mockResolvedValue({ id: 1, deletedAt: new Date() });

    const ctx = makeCtx({ authorization: 'Bearer token' });
    await expect(guard.canActivate(ctx)).rejects.toThrow(UnauthorizedException);

    (prisma.user!.findUnique as jest.Mock).mockResolvedValue({ id: 1, deletedAt: null, emailVerified: false });
    await expect(guard.canActivate(ctx)).rejects.toThrow(UnauthorizedException);
  });

  it('sets request.user and returns true on success', async () => {
    const user = { id: 1, email: 'a@b.com', deletedAt: null, emailVerified: true };
    (authTokenService.verify as jest.Mock).mockReturnValue({ sub: 1 });
    (prisma.user!.findUnique as jest.Mock).mockResolvedValue(user);

    const request: any = { headers: { authorization: 'Bearer token' } };
    const ctx = {
      switchToHttp: jest.fn().mockReturnValue({ getRequest: () => request }),
    } as unknown as ExecutionContext;

    const result = await guard.canActivate(ctx);
    expect(result).toBe(true);
    expect(request.user).toBe(user);
  });
});
