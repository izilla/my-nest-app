import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { UserModel } from '../generated/prisma/models';
import { SecurityService } from '../security/security.service';
import { UsersService } from '../users/users.service';
import { AuthTokenService } from './auth-token.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly securityService: SecurityService,
    private readonly authTokenService: AuthTokenService,
  ) {}

  async signIn(email: string, pass: string): Promise<{ accessToken: string } & Omit<UserModel, 'passwordHash'>> {
    const user = await this.usersService.user({ email });

    if (!user) {
      throw new NotFoundException();
    }

    if (!(await this.securityService.compare(pass, user.passwordHash))) {
      throw new UnauthorizedException();
    }

    const accessToken = this.authTokenService.sign({ sub: user.id });
    const { passwordHash: _pw, ...result } = user;

    return { accessToken, ...result };
  }

  async signUp(params: { email: string; pass: string; name: string }): Promise<Partial<UserModel>> {
    const user = await this.usersService.user({ email: params.email });

    if (user) {
      throw new UnauthorizedException('User already exists');
    }

    const passwordHash = await this.securityService.hash(params.pass);

    const newUser = await this.usersService.createUser({
      email: params.email,
      name: params.name,
      passwordHash,
    });

    const { passwordHash: _pw, ...result } = newUser;

    return result;
  }
}
