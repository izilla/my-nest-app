import { Test, TestingModule } from '@nestjs/testing';
import { SecurityService } from './security.service';

describe('SecurityService', () => {
  let service: SecurityService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SecurityService],
    }).compile();

    service = module.get<SecurityService>(SecurityService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('hash', () => {
    it('should return a hashed string', async () => {
      const password = 'mysecretpassword';
      const hash = await service.hash(password);
      expect(hash).not.toBe(password);
    });
  });

  describe('compare', () => {
    it('should return true for matching passwords', async () => {
      const password = 'mysecretpassword';
      const hash = await service.hash(password);
      const isMatch = await service.compare(password, hash);
      expect(isMatch).toBe(true);
    });

    it('should return false for non-matching passwords', async () => {
      const password = 'mysecretpassword';
      const hash = await service.hash(password);
      const isNotMatch = await service.compare('wrongpassword', hash);
      expect(isNotMatch).toBe(false);
    });
  });

  it('should hash and compare passwords correctly', async () => {
    const password = 'mysecretpassword';
    const hash = await service.hash(password);
    expect(hash).not.toBe(password);

    const isMatch = await service.compare(password, hash);
    expect(isMatch).toBe(true);

    const isNotMatch = await service.compare('wrongpassword', hash);
    expect(isNotMatch).toBe(false);
  });
});
