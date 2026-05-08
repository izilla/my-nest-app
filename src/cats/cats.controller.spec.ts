import { Test, type TestingModule } from '@nestjs/testing';
import { CatsController } from './cats.controller';
import { CatsService } from './cats.service';

describe('CatsController', () => {
  let controller: CatsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CatsController],
      providers: [CatsService, { provide: 'Logger', useValue: { log: jest.fn() } }],
    }).compile();

    controller = module.get<CatsController>(CatsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('root', () => {
    it('should return "Welcome to the Cats API"', () => {
      expect(controller.root()).toBe('Welcome to the Cats API');
    });
  });

  describe('findAll', () => {
    it('should return an array of cats', () => {
      expect(controller.findAll()).toEqual([]);
    });
  });

  describe('new', () => {
    it('should create a new cat and return it', () => {
      const newCat = { name: 'Whiskers', age: 3, breed: 'Siamese' };
      expect(controller.create(newCat)).toEqual({
        id: expect.any(String),
        ...newCat,
      });
    });
  });
});
