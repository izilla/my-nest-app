/** biome-ignore-all lint/complexity/noExcessiveLinesPerFunction: tests are long */
import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '../generated/prisma/enums';
import { RolesGuard } from './roles.guard';

type MockExecutionContext = Partial<ExecutionContext>;

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new RolesGuard(reflector);
  });

  describe('canActivate', () => {
    it('should allow access when no roles are required', () => {
      const mockContext: MockExecutionContext = {
        getHandler: jest.fn(),
        getClass: jest.fn(),
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue({ user: { id: 1, roles: [UserRole.CLIENT] } }),
        }),
      };

      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);

      const result = guard.canActivate(mockContext as ExecutionContext);

      expect(result).toBe(true);
    });

    it('should allow access when user has required role', () => {
      const mockContext: MockExecutionContext = {
        getHandler: jest.fn(),
        getClass: jest.fn(),
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue({
            user: { id: 1, roles: [UserRole.THERAPIST, UserRole.CLIENT] },
          }),
        }),
      };

      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([UserRole.THERAPIST]);

      const result = guard.canActivate(mockContext as ExecutionContext);

      expect(result).toBe(true);
    });

    it('should deny access when user lacks required role', () => {
      const mockContext: MockExecutionContext = {
        getHandler: jest.fn(),
        getClass: jest.fn(),
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue({
            user: { id: 1, roles: [UserRole.CLIENT] },
          }),
        }),
      };

      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([UserRole.THERAPIST]);

      expect(() => guard.canActivate(mockContext as ExecutionContext)).toThrow(ForbiddenException);
    });

    it('should deny access when user has no roles', () => {
      const mockContext: MockExecutionContext = {
        getHandler: jest.fn(),
        getClass: jest.fn(),
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue({
            user: { id: 1, roles: [] },
          }),
        }),
      };

      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([UserRole.THERAPIST]);

      expect(() => guard.canActivate(mockContext as ExecutionContext)).toThrow(ForbiddenException);
    });

    it('should throw error when user is not found in request', () => {
      const mockContext: MockExecutionContext = {
        getHandler: jest.fn(),
        getClass: jest.fn(),
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue({}),
        }),
      };

      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([UserRole.THERAPIST]);

      expect(() => guard.canActivate(mockContext as ExecutionContext)).toThrow(ForbiddenException);
    });

    it('should allow access when user has any of multiple required roles', () => {
      const mockContext: MockExecutionContext = {
        getHandler: jest.fn(),
        getClass: jest.fn(),
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue({
            user: { id: 1, roles: [UserRole.TENANT_ADMIN] },
          }),
        }),
      };

      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([UserRole.THERAPIST, UserRole.TENANT_ADMIN]);

      const result = guard.canActivate(mockContext as ExecutionContext);

      expect(result).toBe(true);
    });
  });
});
