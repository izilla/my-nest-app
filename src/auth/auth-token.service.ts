import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import crypto from 'crypto';

interface AuthPayload {
  sub: number;
  exp: number;
}

@Injectable()
export class AuthTokenService {
  private readonly secret: string;
  private readonly tokenTtlSeconds: number;

  constructor(private readonly configService: ConfigService) {
    this.secret = this.configService.get<string>('AUTH_TOKEN_SECRET') || 'auth-token-secret';
    this.tokenTtlSeconds = parseInt(this.configService.get<string>('AUTH_TOKEN_TTL_SECONDS') ?? '86400', 10);
  }

  sign(payload: { sub: number }): string {
    const authPayload: AuthPayload = {
      sub: payload.sub,
      exp: Math.floor(Date.now() / 1000) + this.tokenTtlSeconds,
    };
    const encoded = this.base64UrlEncode(Buffer.from(JSON.stringify(authPayload), 'utf8'));
    const signature = this.signPayload(encoded);
    return `${encoded}.${signature}`;
  }

  verify(token: string): AuthPayload {
    const [encoded, signature] = token.split('.');

    if (!encoded || !signature) {
      throw new UnauthorizedException('Invalid authentication token');
    }

    const expected = this.signPayload(encoded);
    const signatureBuffer = Buffer.from(signature, 'hex');
    const expectedBuffer = Buffer.from(expected, 'hex');

    if (signatureBuffer.length !== expectedBuffer.length || !crypto.timingSafeEqual(signatureBuffer, expectedBuffer)) {
      throw new UnauthorizedException('Invalid authentication token');
    }

    const payloadJson = Buffer.from(this.base64UrlDecode(encoded), 'base64').toString('utf8');
    const payload = JSON.parse(payloadJson) as AuthPayload;

    if (!payload.sub || !payload.exp) {
      throw new UnauthorizedException('Invalid authentication token');
    }

    if (Math.floor(Date.now() / 1000) > payload.exp) {
      throw new UnauthorizedException('Authentication token expired');
    }

    return payload;
  }

  private signPayload(payload: string): string {
    return crypto.createHmac('sha256', this.secret).update(payload).digest('hex');
  }

  private base64UrlEncode(payload: Buffer): string {
    return payload.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
  }

  private base64UrlDecode(payload: string): string {
    const padded = payload.padEnd(payload.length + ((4 - (payload.length % 4)) % 4), '=');
    return padded.replace(/-/g, '+').replace(/_/g, '/');
  }
}
