import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import crypto from 'crypto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EmailVerificationService {
  private readonly baseUrl: string;
  private readonly tokenTtlSeconds: number;

  constructor(private readonly prisma: PrismaService, private readonly configService: ConfigService) {
    this.baseUrl =
      this.configService.get<string>('EMAIL_VERIFICATION_BASE_URL') || 'http://localhost:3000';
    this.tokenTtlSeconds = parseInt(this.configService.get<string>('EMAIL_VERIFICATION_TOKEN_TTL_SECONDS') ?? '86400', 10);
  }

  async sendVerificationEmail(email: string): Promise<{ verificationUrl: string }> {
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.emailVerified) {
      return {
        verificationUrl: `${this.baseUrl}/users/verify-email?token=already-verified`,
      };
    }

    const token = this.createToken();
    const expiresAt = new Date(Date.now() + this.tokenTtlSeconds * 1000);

    await this.prisma.emailVerificationToken.create({
      data: {
        user: { connect: { id: user.id } },
        token,
        expiresAt,
      },
    });

    const verificationUrl = `${this.baseUrl}/users/verify-email?token=${encodeURIComponent(token)}`;

    console.info(`Sending email verification to ${email}: ${verificationUrl}`);

    return { verificationUrl };
  }

  async verifyEmailToken(token: string): Promise<{ email: string; emailVerified: boolean }> {
    const verificationToken = await this.prisma.emailVerificationToken.findFirst({
      where: {
        token,
        usedAt: null,
        expiresAt: {
          gte: new Date(),
        },
      },
      include: {
        user: true,
      },
    });

    if (!verificationToken) {
      throw new BadRequestException('Invalid or expired verification token');
    }

    const user = verificationToken.user;

    await this.prisma.emailVerificationToken.update({
      where: { id: verificationToken.id },
      data: { usedAt: new Date() },
    });

    if (!user.emailVerified) {
      await this.prisma.user.update({
        where: { id: user.id },
        data: { emailVerified: true },
      });
    }

    return { email: user.email, emailVerified: true };
  }

  private createToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }
}
