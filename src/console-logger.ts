import { Injectable } from '@nestjs/common';
import type { Logger } from './logger.interface';

@Injectable()
export class ConsoleLoger implements Logger {
  log(message: string): void {
    console.log(message);
  }
}
