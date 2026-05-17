import { Injectable, NotFoundException } from '@nestjs/common';
import { User } from '../generated/prisma/client';
import {
  UserCreateInput,
  UserOrderByWithRelationInput,
  UserUpdateInput,
  UserWhereInput,
  UserWhereUniqueInput,
} from '../generated/prisma/models';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async userIncludeDeleted(userWhereUniqueInput: UserWhereUniqueInput): Promise<User | null> {
    const user = this.prisma.client.user.findUnique({
      where: userWhereUniqueInput,
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async user(userWhereUniqueInput: UserWhereUniqueInput): Promise<User | null> {
    const user = this.prisma.client.user.findUnique({
      where: userWhereUniqueInput,
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async users(params: {
    skip?: number;
    take?: number;
    cursor?: UserWhereUniqueInput;
    where?: UserWhereInput;
    orderBy?: UserOrderByWithRelationInput;
  }): Promise<User[]> {
    const { skip, take, cursor, where, orderBy } = params;
    return this.prisma.client.user.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
    });
  }

  async createUser(data: UserCreateInput): Promise<User> {
    return this.prisma.user.create({
      data,
    });
  }

  async updateUser(params: { where: UserWhereUniqueInput; data: UserUpdateInput }): Promise<User> {
    const { where, data } = params;
    return this.prisma.user.update({
      data,
      where,
    });
  }

  async hardDeleteUser(where: UserWhereUniqueInput): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where,
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const deletedUser = (await this.prisma.user.delete({
      where,
    })) as User;

    return deletedUser;
  }

  async deleteUser(where: UserWhereUniqueInput): Promise<User> {
    const user = await this.prisma.client.user.findUnique({
      where,
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const deletedUser = (await this.prisma.client.user.delete({
      ...where,
    })) as User;

    return deletedUser;
  }
}
