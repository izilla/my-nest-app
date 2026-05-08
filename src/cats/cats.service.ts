import { randomUUID } from 'node:crypto';
import { Injectable } from '@nestjs/common';
import { Cat } from './cats.controller';

@Injectable()
export class CatsService {
  private readonly cats: Cat[] = [];

  findAll(): Cat[] {
    return this.cats;
  }

  push(cat: Omit<Cat, 'id'>): Cat {
    const newCatId = randomUUID();
    this.cats.push({ id: newCatId, ...cat });
    return { id: newCatId, ...cat };
  }
}
