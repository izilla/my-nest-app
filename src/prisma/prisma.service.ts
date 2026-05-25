import 'dotenv/config';
import { Injectable } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClientExtended } from './custom-prisma-client';

const connectionString = `${process.env.DATABASE_URL}`;

@Injectable()
export class PrismaService extends PrismaClientExtended {
  constructor() {
    const adapter = new PrismaPg({ connectionString });
    super({ adapter });
  }
}
