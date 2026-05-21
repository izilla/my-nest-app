import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { User } from '../generated/prisma/client';
import { UserModel } from '../generated/prisma/models';
import { EmailVerificationService } from '../email/email-verification.service';
import { UsersService } from './users.service';
import { AuthGuard } from '../auth/auth.guard';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly emailVerificationService: EmailVerificationService,
  ) {}

  @Get()
  root(): Promise<User[]> {
    return this.usersService.users({});
  }

  @Post('send-verification')
  async sendVerification(@Body() body: { email: string }): Promise<{ verificationUrl: string }> {
    if (!body.email) {
      throw new BadRequestException('Email is required');
    }

    return this.emailVerificationService.sendVerificationEmail(body.email);
  }

  @Get('verify-email')
  async verifyEmail(@Query('token') token: string): Promise<{ email: string; emailVerified: boolean }> {
    if (!token) {
      throw new BadRequestException('Verification token is required');
    }

    return this.emailVerificationService.verifyEmailToken(token);
  }

  @Get(':id')
  async getUser(@Param('id') id: string): Promise<User | null> {
    const user = await this.usersService.user({ id: Number(id) });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.usersService.user({ id: Number(id) });
  }

  @UseGuards(AuthGuard)
  @Patch(':id')
  async updateUser(@Param('id') id: string, @Body() userData: Pick<Partial<User>, 'email' | 'name'>): Promise<User> {
    const user = await this.usersService.user({ id: Number(id) });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.usersService.updateUser({
      where: { id: Number(id) },
      data: userData,
    });
  }

  @Post()
  async signupUser(@Body() userData: { email: string; name?: string }): Promise<UserModel> {
    const existingUser = await this.usersService.user({ email: userData.email });

    if (existingUser) {
      throw new BadRequestException('User already exists');
    }

    return this.usersService.createUser(userData);
  }

  // TODO: Add authentication and authorization check for internal user (not to be used in production)
  @UseGuards(AuthGuard)
  @Delete()
  async deleteAllUsers(): Promise<number> {
    const users = await this.usersService.users({});

    if (users.length === 0) {
      throw new NotFoundException('No users found');
    }

    return Promise.all(users.map(user => this.usersService.deleteUser({ id: user.id }))).then(
      deletedUsers => deletedUsers.length,
    );
  }

  // TODO: Add authentication and authorization check for internal user (not to be used in production)
  @UseGuards(AuthGuard)
  @Delete(':id/hard')
  async deleteUser(@Param('id') id: string): Promise<User> {
    const user = await this.usersService.userIncludeDeleted({ id: Number(id) });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.usersService.hardDeleteUser({ id: Number(id) });
  }

  @UseGuards(AuthGuard)
  @Delete(':id')
  async softDeleteUser(@Param('id') id: string): Promise<User> {
    const user = await this.usersService.user({ id: Number(id) });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.usersService.updateUser({
      where: { id: Number(id) },
      data: { deletedAt: new Date() },
    });
  }
}
