import { Injectable } from '@nestjs/common';
import type { Logger } from './logger.interface';

@Injectable()
export class FileLogger implements Logger {
  log(message: string): void {
    console.log('Logging to a file:', message);
  }
}
