/** biome-ignore-all lint/security/noSecrets: no real secrets exposed */
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { AppService } from './app.service';

describe('AppService', () => {
  let service: AppService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AppService, { provide: ConfigService, useValue: { get: jest.fn().mockReturnValue('MyAwesomeApp') } }],
    }).compile();

    service = module.get<AppService>(AppService);
  });

  it('should return "Hello MyAwesomeApp!"', () => {
    expect(service.getHello()).toBe('Hello MyAwesomeApp!');
  });
});
