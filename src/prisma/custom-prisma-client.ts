import { PrismaClient } from '../generated/prisma/client';
import { filterSoftDeleted, softDelete, softDeleteMany } from './prisma.extensions';

export type CustomPrismaClient = ReturnType<typeof customPrismaClient>;

export const customPrismaClient = (prismaClient: PrismaClient) => {
  return prismaClient.$extends(softDelete).$extends(softDeleteMany).$extends(filterSoftDeleted);
};

export class PrismaClientExtended extends PrismaClient {
  customPrismaClient: CustomPrismaClient | undefined;

  get client(): CustomPrismaClient {
    if (!this.customPrismaClient) {
      this.customPrismaClient = customPrismaClient(this);
    }
    return this.customPrismaClient;
  }
}
