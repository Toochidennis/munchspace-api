import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class TokenUtil {
  constructor(private readonly jwtService: JwtService) {}

  generateAccessToken(userId: string, role: string): string {
    return this.jwtService.sign({ sub: userId, role });
  }

  generateRefreshToken(userId: string, role: string): string {
    return this.jwtService.sign({ sub: userId, role }, { expiresIn: '7d' });
  }
}
