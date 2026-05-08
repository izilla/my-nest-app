import { Body, Controller, Get, Inject, Put } from '@nestjs/common';
import type { Logger } from '../logger.interface';
import { CatsService } from './cats.service';

export type Cat = {
  id: string;
  name: string;
  age: number;
  breed: string;
};

@Controller('cats')
export class CatsController {
  constructor(
    @Inject('Logger') private readonly logger: Logger,
    private readonly catsService: CatsService,
  ) {}

  @Get()
  root(): string {
    this.logger.log('Accessing the Cats API');
    return 'Welcome to the Cats API';
  }

  @Get('all')
  findAll(): Cat[] {
    return this.catsService.findAll();
  }

  @Put('new')
  create(@Body() cat: Omit<Cat, 'id'>): Cat {
    return this.catsService.push(cat);
  }
}
