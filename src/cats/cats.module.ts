import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ConsoleLoger } from '../console-logger';
import { CatsController } from './cats.controller';
import { CatsService } from './cats.service';

@Module({
  imports: [ConfigModule],
  controllers: [CatsController],
  providers: [CatsService, { provide: 'Logger', useClass: ConsoleLoger }],
})
export class CatsModule {}
