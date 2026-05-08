import { Body, Controller, Post } from '@nestjs/common';
import { UserModel } from '../generated/prisma/models';
import { UsersService } from './users.service';

@Controller()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  signupUser(@Body() userData: { email: string; name?: string }): Promise<UserModel> {
    return this.usersService.createUser(userData);
  }
}
