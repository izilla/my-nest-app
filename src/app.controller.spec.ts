/** biome-ignore-all lint/security/noSecrets: these are not real secrets */

import { ConfigService } from '@nestjs/config';
import { Test, type TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConsoleLoger } from './console-logger';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        AppService,
        { provide: ConfigService, useValue: { get: jest.fn().mockReturnValue('MyAwesomeApp') } },
        { provide: 'Logger', useClass: ConsoleLoger },
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return "Hello MyAwesomeApp!"', () => {
      expect(appController.getHello()).toBe('Hello MyAwesomeApp!');
    });
  });
});
