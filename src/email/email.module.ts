import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '../prisma/prisma.module';
import { EmailVerificationService } from './email-verification.service';

@Module({
  imports: [ConfigModule, PrismaModule],
  providers: [EmailVerificationService],
  exports: [EmailVerificationService],
})
export class EmailModule {}
