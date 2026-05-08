import { Test, type TestingModule } from '@nestjs/testing';
import { CatsService } from './cats.service';

describe('CatsService', () => {
  let service: CatsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CatsService],
    }).compile();

    service = module.get<CatsService>(CatsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should find all cats', () => {
    expect(service.findAll()).toEqual([]);
  });

  it('persists new cats', () => {
    const newCat = { name: 'Whiskers', age: 3, breed: 'Siamese' };
    service.push(newCat);
    expect(service.findAll()).toEqual([{ id: expect.any(String), ...newCat }]);
  });
});
