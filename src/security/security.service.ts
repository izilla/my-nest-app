import { Injectable } from '@nestjs/common';
import bcrypt from 'bcrypt';
import crypto from 'crypto';

const PEPPER = process.env.PEPPER || 'some-really-long-string-that-is-unique-to-something-or-someone';
const HASH_ROUNDS = parseInt(process.env.HASH_ROUNDS ?? '10', 10) || 10;

@Injectable()
export class SecurityService {
  async hash(input: string): Promise<string> {
    const hmac = crypto.createHmac('sha256', PEPPER);
    hmac.update(input);
    const preHash: string = hmac.digest('hex');

    const hashed: string = await bcrypt.hash(preHash, HASH_ROUNDS);
    return hashed;
  }

  async compare(input: string, hashedInput) {
    const hmac = crypto.createHmac('sha256', PEPPER);
    hmac.update(input);
    const preHash: string = hmac.digest('hex');

    const isMatch: boolean = await bcrypt.compare(preHash, hashedInput);
    return isMatch;
  }
}
