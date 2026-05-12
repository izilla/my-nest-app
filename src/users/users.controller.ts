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
} from '@nestjs/common';
import { User } from '../generated/prisma/client';
import { UserModel } from '../generated/prisma/models';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  root(): Promise<User[]> {
    return this.usersService.users({});
  }

  @Get(':id')
  async getUser(@Param('id') id: string): Promise<User | null> {
    const user = await this.usersService.user({ id: Number(id) });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.usersService.user({ id: Number(id) });
  }

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
  @Delete(':id/hard')
  async deleteUser(@Param('id') id: string): Promise<User> {
    const user = await this.usersService.userIncludeDeleted({ id: Number(id) });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.usersService.hardDeleteUser({ id: Number(id) });
  }

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
