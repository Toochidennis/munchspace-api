import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from '@/modules/auth/types/jwt-payload.type';

@Injectable()
export class TokenUtil {
  constructor(private readonly jwtService: JwtService) {}

  generateAccessToken(payload: JwtPayload): string {
    return this.jwtService.sign(payload, { expiresIn: '15m' });
  }

  generateRefreshToken(payload: JwtPayload): string {
    return this.jwtService.sign(payload, { expiresIn: '7d' });
  }
}
