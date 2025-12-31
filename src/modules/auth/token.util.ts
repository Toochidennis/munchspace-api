import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from '@/modules/auth/types/jwt-payload.type';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class TokenUtil {
  constructor(
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  generateAccessToken(payload: JwtPayload): string {
    return this.jwtService.sign(payload, { expiresIn: '2hr' });
  }

  generateRefreshToken(payload: JwtPayload): string {
    return this.jwtService.sign(payload, {
      expiresIn: '180d',
      secret: this.config.get('JWT_REFRESH_SECRET'),
    });
  }
}
