import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class TokenUtil {
  constructor(private readonly jwtService: JwtService) {}

  generateAccessToken(user: any): string {
    return this.jwtService.sign({ sub: user.id, role: user.role });
  }

  generateRefreshToken(user: any): string {
    return this.jwtService.sign({ sub: user.id }, { expiresIn: '7d' });
  }
}
