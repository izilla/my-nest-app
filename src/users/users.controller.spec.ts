/** biome-ignore-all lint/complexity/noExcessiveLinesPerFunction: specs are long */
import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

type MockUsersServiceType = {
  users: jest.MockedFunction<UsersService['users']>;
  user: jest.MockedFunction<UsersService['user']>;
  createUser: jest.MockedFunction<UsersService['createUser']>;
  updateUser: jest.MockedFunction<UsersService['updateUser']>;
  hardDeleteUser: jest.MockedFunction<UsersService['hardDeleteUser']>;
  deleteUser: jest.MockedFunction<UsersService['deleteUser']>;
};

const MockUsersService: MockUsersServiceType = {
  users: jest.fn(),
  user: jest.fn(),
  createUser: jest.fn(),
  updateUser: jest.fn(),
  hardDeleteUser: jest.fn(),
  deleteUser: jest.fn(),
};

const mockUser = {
  id: 1,
  email: 'test@example.com',
  name: 'Test User',
  deletedAt: null,
  tenantId: 1,
  tenantAdminId: 1,
  passwordHash: 'hashedpassword',
};

describe('UsersController', () => {
  let controller: UsersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        UsersService,
        {
          provide: UsersService,
          useValue: MockUsersService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    MockUsersService.users.mockReset();
    MockUsersService.user.mockReset();
    MockUsersService.createUser.mockReset();
    MockUsersService.updateUser.mockReset();
    MockUsersService.hardDeleteUser.mockReset();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('root', () => {
    it('get all users', () => {
      controller.root();

      expect(MockUsersService.users).toHaveBeenCalled();
    });
  });

  describe('getUser', () => {
    it('should get a user by id', async () => {
      const userId = '1';
      MockUsersService.user.mockResolvedValue(mockUser);

      await controller.getUser(userId);

      expect(MockUsersService.user).toHaveBeenCalledWith({ id: Number(userId) });
    });

    it('should throw NotFoundException if user is null', () => {
      MockUsersService.user.mockResolvedValue(null);

      expect(async () => await controller.getUser('')).rejects.toThrow('User not found');
    });
  });

  describe('updateUser', () => {
    it('should update a user', async () => {
      MockUsersService.user.mockResolvedValue(mockUser);

      await controller.updateUser('1', { name: 'Updated Name' });

      expect(MockUsersService.user).toHaveBeenCalledWith({ id: 1 });
      expect(MockUsersService.updateUser).toHaveBeenCalledWith({ data: { name: 'Updated Name' }, where: { id: 1 } });
    });

    it('should throw NotFoundException if user is null', async () => {
      MockUsersService.user.mockResolvedValue(null);

      expect(async () => await controller.updateUser('1', { name: 'Updated Name' })).rejects.toThrow('User not found');
    });
  });

  describe('signupUser', () => {
    it('should create a new user', () => {
      controller.signupUser({ email: 'test@example.com', name: 'Test User' });

      expect(MockUsersService.createUser).toHaveBeenCalledWith({ email: 'test@example.com', name: 'Test User' });
    });
  });

  describe('deleteAllUsers', () => {
    it('should delete all users', async () => {
      MockUsersService.users.mockResolvedValue([mockUser]);

      const deletedCount = await controller.deleteAllUsers();

      expect(MockUsersService.users).toHaveBeenCalled();
      expect(MockUsersService.deleteUser).toHaveBeenCalledWith({ id: mockUser.id });
      expect(deletedCount).toBe(1);
    });

    it('should throw NotFoundException if no users found', async () => {
      MockUsersService.users.mockResolvedValue([]);

      expect(async () => await controller.deleteAllUsers()).rejects.toThrow('No users found');
    });
  });

  describe('deleteUser', () => {
    it('should hard delete a user by ID', async () => {
      const userId = '1';
      MockUsersService.user.mockResolvedValue(mockUser);

      await controller.deleteUser(userId);

      expect(MockUsersService.user).toHaveBeenCalledWith({ id: Number(userId) });
      expect(MockUsersService.hardDeleteUser).toHaveBeenCalledWith({ id: Number(userId) });
    });

    it('should throw NotFoundException if user is null', async () => {
      MockUsersService.user.mockResolvedValue(null);

      expect(async () => await controller.deleteUser('1')).rejects.toThrow('User not found');
    });
  });

  describe('softDeleteUser', () => {
    it('should soft delete a user by ID', async () => {
      const userId = '1';
      MockUsersService.user.mockResolvedValue(mockUser);

      await controller.softDeleteUser(userId);

      expect(MockUsersService.user).toHaveBeenCalledWith({ id: Number(userId) });
      expect(MockUsersService.deleteUser).toHaveBeenCalledWith({ id: Number(userId) });
    });

    it('should throw NotFoundException if user is null', async () => {
      MockUsersService.user.mockResolvedValue(null);

      expect(async () => await controller.softDeleteUser('1')).rejects.toThrow('User not found');
    });
  });
});
