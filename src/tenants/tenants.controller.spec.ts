import { Test, TestingModule } from '@nestjs/testing';
import { TenantsController } from './tenants.controller';
import { TenantsService } from './tenants.service';
import { AuthTokenService } from '../auth/auth-token.service';

describe('TenantsController', () => {
  let controller: TenantsController;

  beforeEach(async () => {
    const mockTenantService = {
      tenant: jest.fn(),
    };

    const mockAuthTokenService = {
      sign: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [TenantsController],
      providers: [
        {
          provide: TenantsService,
          useValue: mockTenantService,
        },
              {
                provide: AuthTokenService,
                useValue: mockAuthTokenService,
              },
      ],
    }).compile();

    controller = module.get<TenantsController>(TenantsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
