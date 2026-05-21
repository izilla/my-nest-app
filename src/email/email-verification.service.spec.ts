import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EmailVerificationService } from './email-verification.service';

const mockPrismaService = {
  user: {
    findUnique: jest.fn(),
    update: jest.fn(),
  },
  emailVerificationToken: {
    create: jest.fn(),
    findFirst: jest.fn(),
    update: jest.fn(),
  },
};

const mockConfigService: Partial<ConfigService> = {
  get: jest.fn((key: string) => {
    switch (key) {
      case 'EMAIL_VERIFICATION_BASE_URL':
        return 'http://localhost:3000';
      case 'EMAIL_VERIFICATION_SECRET':
        return 'test-secret';
      case 'EMAIL_VERIFICATION_TOKEN_TTL_SECONDS':
        return '3600';
      default:
        return undefined;
    }
  }),
};

describe('EmailVerificationService', () => {
  let service: EmailVerificationService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new EmailVerificationService(mockPrismaService as any, mockConfigService as ConfigService);
  });

  it('should send a verification email for an unverified user', async () => {
    const user = { id: 1, email: 'test@example.com', emailVerified: false };
    mockPrismaService.user.findUnique.mockResolvedValue(user);
    mockPrismaService.emailVerificationToken.create.mockResolvedValue({});

    const result = await service.sendVerificationEmail('test@example.com');

    expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({ where: { email: 'test@example.com' } });
    expect(mockPrismaService.emailVerificationToken.create).toHaveBeenCalledWith({
      data: {
        user: { connect: { id: user.id } },
        token: expect.any(String),
        expiresAt: expect.any(Date),
      },
    });
    expect(result.verificationUrl).toContain('http://localhost:3000/users/verify-email?token=');
    const createdToken = mockPrismaService.emailVerificationToken.create.mock.calls[0][0].data.token;
    expect(result.verificationUrl).toContain(createdToken);
  });

  it('should throw NotFoundException when the user does not exist', async () => {
    mockPrismaService.user.findUnique.mockResolvedValue(null);

    await expect(service.sendVerificationEmail('missing@example.com')).rejects.toThrow(NotFoundException);
  });

  it('should verify a token and mark it used', async () => {
    const user = { id: 1, email: 'test@example.com', emailVerified: false };
    const verificationToken = {
      id: 1,
      token: 'abc123',
      expiresAt: new Date(Date.now() + 10000),
      usedAt: null,
      createdAt: new Date(),
      user,
    };

    mockPrismaService.emailVerificationToken.findFirst.mockResolvedValue(verificationToken);
    mockPrismaService.emailVerificationToken.update.mockResolvedValue({});
    mockPrismaService.user.update.mockResolvedValue({ ...user, emailVerified: true });

    const result = await service.verifyEmailToken('abc123');

    expect(mockPrismaService.emailVerificationToken.findFirst).toHaveBeenCalledWith({
      where: {
        token: 'abc123',
        usedAt: null,
        expiresAt: { gte: expect.any(Date) },
      },
      include: { user: true },
    });
    expect(mockPrismaService.emailVerificationToken.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { usedAt: expect.any(Date) },
    });
    expect(mockPrismaService.user.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { emailVerified: true },
    });
    expect(result).toEqual({ email: 'test@example.com', emailVerified: true });
  });

  it('should throw BadRequestException for expired or invalid token', async () => {
    mockPrismaService.emailVerificationToken.findFirst.mockResolvedValue(null);

    await expect(service.verifyEmailToken('invalid-token')).rejects.toThrow(BadRequestException);
  });
});
