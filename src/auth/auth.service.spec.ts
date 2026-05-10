import { Test, TestingModule } from '@nestjs/testing';
import { User } from '../generated/prisma/client';
import { SecurityService } from '../security/security.service';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';

type MockSecurityServiceType = {
  hash: jest.MockedFunction<SecurityService['hash']>;
  compare: jest.MockedFunction<SecurityService['compare']>;
};

const MockSecurityService: MockSecurityServiceType = {
  hash: jest.fn(),
  compare: jest.fn(),
};

type MockUsersServiceType = {
  user: jest.MockedFunction<UsersService['user']>;
  createUser: jest.MockedFunction<UsersService['createUser']>;
};

const MockUsersService: MockUsersServiceType = {
  user: jest.fn(),
  createUser: jest.fn(),
};

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: SecurityService, useValue: MockSecurityService },
        { provide: UsersService, useValue: MockUsersService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('signIn', () => {
    it('should sign in a user', async () => {
      const fakeUser = {
        email: 'fakeuser@email.com',
        passwordHash: '123',
      } as User;
      MockUsersService.user.mockResolvedValue(fakeUser);
      MockSecurityService.compare.mockResolvedValue(true);

      await service.signIn('fakeuser@email.com', 'pass');

      expect(MockUsersService.user).toHaveBeenCalledWith({ email: fakeUser.email });
      expect(MockSecurityService.compare).toHaveBeenCalledWith('pass', '123');
    });
  });

  describe('signUp', () => {
    it('should sign up a new user', async () => {
      const newUser = {
        email: 'newuser@example.com',
        name: 'New User',
        pass: 'password',
      };
      MockUsersService.user.mockResolvedValue(null);
      MockSecurityService.hash.mockResolvedValue('hashedPassword');
      MockUsersService.createUser.mockResolvedValue({
        email: newUser.email,
        name: newUser.name,
        passwordHash: 'hashedPassword',
      } as User);

      await service.signUp(newUser);

      expect(MockUsersService.user).toHaveBeenCalledWith({ email: newUser.email });
      expect(MockSecurityService.hash).toHaveBeenCalledWith(newUser.pass);
      expect(MockUsersService.createUser).toHaveBeenCalledWith({
        email: newUser.email,
        name: newUser.name,
        passwordHash: 'hashedPassword',
      });
    });
  });
});
