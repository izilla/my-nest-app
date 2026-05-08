import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { User } from '../generated/prisma/client';
import { UserModel } from '../generated/prisma/models';
import { UsersService } from './users.service';

@Controller()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  getUser(@Param('id') id: string): Promise<User | null> {
    return this.usersService.user({ id: Number(id) });
  }

  @Post()
  signupUser(@Body() userData: { email: string; name?: string }): Promise<UserModel> {
    return this.usersService.createUser(userData);
  }
}
