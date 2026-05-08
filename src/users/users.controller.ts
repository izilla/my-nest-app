import { Body, Controller, Delete, Get, NotFoundException, Param, Patch, Post } from '@nestjs/common';
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
  async updateUser(@Param('id') id: string, @Body() userData: { email?: string; name?: string }): Promise<User> {
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
  signupUser(@Body() userData: { email: string; name?: string }): Promise<UserModel> {
    return this.usersService.createUser(userData);
  }

  // TODO: Add authentication and authorization check for internal user (not to be used in production)
  @Delete()
  async deleteAllUsers(): Promise<number> {
    const users = await this.usersService.users({});
    return Promise.all(users.map(user => this.usersService.deleteUser({ id: user.id }))).then(
      deletedUsers => deletedUsers.length,
    );
  }

  // TODO: Add authentication and authorization check for internal user (not to be used in production)
  @Delete(':id/hard')
  async deleteUser(@Param('id') id: string): Promise<User> {
    const user = await this.usersService.user({ id: Number(id) });

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
