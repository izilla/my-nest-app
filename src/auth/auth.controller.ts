import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { UserModel } from '../generated/prisma/models';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @HttpCode(200)
  @Post('login')
  signIn(
    @Body() signInDto: Record<string, string>,
  ): Promise<{ accessToken: string } & Omit<UserModel, 'passwordHash'>> {
    return this.authService.signIn(signInDto.email, signInDto.pass);
  }
}
