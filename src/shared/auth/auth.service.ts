import { Injectable, UnauthorizedException } from '@nestjs/common';
import { IdentityService } from 'src/identity/identity.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    private identity: IdentityService,
    private jwt: JwtService,
  ) {}

  async login(email: string, pass: string) {
    const user = await this.identity.findByEmail(email);
    if (!user || !(await bcrypt.compare(pass, user.password))) {
      throw new UnauthorizedException();
    }
    const token = this.jwt.sign({
      sub: user.id,
      email: user.email,
      role: user.role,
    });
    return { access_token: token };
  }
}
