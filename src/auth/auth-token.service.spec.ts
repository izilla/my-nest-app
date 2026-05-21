/** biome-ignore-all lint/complexity/noExcessiveLinesPerFunction: tests */

import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import crypto from 'crypto';
import { AuthTokenService } from './auth-token.service';

describe('AuthTokenService', () => {
  let service: AuthTokenService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthTokenService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              const config = {
                AUTH_TOKEN_SECRET: 'test-secret-key',
                AUTH_TOKEN_TTL_SECONDS: '3600',
              };
              return config[key];
            }),
          },
        },
      ],
    }).compile();

    service = module.get<AuthTokenService>(AuthTokenService);
  });

  describe('sign', () => {
    it('should create a valid token with sub and exp', () => {
      const payload = { sub: 123 };
      const token = service.sign(payload);

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(2);
    });

    it('should generate different tokens for different users', () => {
      const token1 = service.sign({ sub: 1 });
      const token2 = service.sign({ sub: 2 });

      expect(token1).not.toBe(token2);
    });

    it('should include the correct sub in the token payload', () => {
      const payload = { sub: 456 };
      const token = service.sign(payload);
      const verified = service.verify(token);

      expect(verified.sub).toBe(456);
    });

    it('should set expiration time based on TTL', () => {
      const beforeSign = Math.floor(Date.now() / 1000);
      const token = service.sign({ sub: 1 });
      const afterSign = Math.floor(Date.now() / 1000);

      const verified = service.verify(token);
      const expectedExp = beforeSign + 3600;

      expect(verified.exp).toBeGreaterThanOrEqual(expectedExp);
      expect(verified.exp).toBeLessThanOrEqual(afterSign + 3600);
    });
  });

  describe('verify', () => {
    it('should successfully verify a valid token', () => {
      const payload = { sub: 789 };
      const token = service.sign(payload);
      const verified = service.verify(token);

      expect(verified.sub).toBe(789);
      expect(verified.exp).toBeDefined();
    });

    it('should throw UnauthorizedException for invalid format (missing dot)', () => {
      const invalidToken = 'invalidtokenwithnodot';

      expect(() => service.verify(invalidToken)).toThrow(UnauthorizedException);
      expect(() => service.verify(invalidToken)).toThrow('Invalid authentication token');
    });

    it('should throw UnauthorizedException for tampered signature', () => {
      const payload = { sub: 1 };
      const token = service.sign(payload);
      const [encoded, signature] = token.split('.');

      // Tamper with the signature
      const tamperedSignature = Buffer.from(
        Buffer.from(signature, 'hex').map((b, i) => (i === 0 ? b ^ 0xff : b)),
      ).toString('hex');
      const tamperedToken = `${encoded}.${tamperedSignature}`;

      expect(() => service.verify(tamperedToken)).toThrow(UnauthorizedException);
      expect(() => service.verify(tamperedToken)).toThrow('Invalid authentication token');
    });

    it('should throw UnauthorizedException for tampered payload', () => {
      const payload = { sub: 1 };
      const token = service.sign(payload);
      const [encoded, signature] = token.split('.');

      // Tamper with the encoded payload
      const decodedPayload = Buffer.from(
        encoded
          .replace(/-/g, '+')
          .replace(/_/g, '/')
          .padEnd(encoded.length + ((4 - (encoded.length % 4)) % 4), '='),
        'base64',
      ).toString('utf8');

      const tamperedPayload = JSON.stringify({ ...JSON.parse(decodedPayload), sub: 999 });
      const tamperedEncoded = Buffer.from(tamperedPayload)
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/g, '');

      const tamperedToken = `${tamperedEncoded}.${signature}`;

      expect(() => service.verify(tamperedToken)).toThrow(UnauthorizedException);
      expect(() => service.verify(tamperedToken)).toThrow('Invalid authentication token');
    });

    it('should throw UnauthorizedException for expired token', async () => {
      // Mock a config with very short TTL
      const moduleWithShortTtl = await Test.createTestingModule({
        providers: [
          AuthTokenService,
          {
            provide: ConfigService,
            useValue: {
              get: jest.fn((key: string) => {
                const config = {
                  AUTH_TOKEN_SECRET: 'test-secret-key',
                  AUTH_TOKEN_TTL_SECONDS: '-1', // Already expired
                };
                return config[key];
              }),
            },
          },
        ],
      }).compile();

      const expiredService = moduleWithShortTtl.get<AuthTokenService>(AuthTokenService);
      const token = expiredService.sign({ sub: 1 });

      expect(() => expiredService.verify(token)).toThrow(UnauthorizedException);
      expect(() => expiredService.verify(token)).toThrow('Authentication token expired');
    });

    it('should throw UnauthorizedException for token with missing sub', () => {
      // Manually create a token without sub
      const invalidPayload = { exp: Math.floor(Date.now() / 1000) + 3600 };
      const encoded = Buffer.from(JSON.stringify(invalidPayload))
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/g, '');

      const signature = crypto.createHmac('sha256', 'test-secret-key').update(encoded).digest('hex');

      const token = `${encoded}.${signature}`;

      expect(() => service.verify(token)).toThrow(UnauthorizedException);
      expect(() => service.verify(token)).toThrow('Invalid authentication token');
    });

    it('should throw UnauthorizedException for token with missing exp', () => {
      // Manually create a token without exp
      const invalidPayload = { sub: 1 };
      const encoded = Buffer.from(JSON.stringify(invalidPayload))
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/g, '');

      const signature = crypto.createHmac('sha256', 'test-secret-key').update(encoded).digest('hex');

      const token = `${encoded}.${signature}`;

      expect(() => service.verify(token)).toThrow(UnauthorizedException);
      expect(() => service.verify(token)).toThrow('Invalid authentication token');
    });

    it('should throw UnauthorizedException for malformed base64 payload', () => {
      const invalidToken = 'not-valid-base64!!!.abcdef123456';

      expect(() => service.verify(invalidToken)).toThrow(UnauthorizedException);
    });
  });

  describe('roundtrip', () => {
    it('should sign and verify a token successfully multiple times', () => {
      const userIds = [1, 42, 999, 12345];

      for (const userId of userIds) {
        const token = service.sign({ sub: userId });
        const verified = service.verify(token);

        expect(verified.sub).toBe(userId);
        expect(verified.exp).toBeDefined();
      }
    });
  });
});
