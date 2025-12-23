import { Controller, Post, Body } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { LoginDto, SendOtpDto, VerifyOtpDto } from '@/shared/auth/dto';
import { AuthService } from '@/shared/auth/auth.service.js';
import { RefreshDto } from '@/shared/auth/dto/refresh.dto';

@Controller('auth')
export class AuthController {
  constructor(private auth: AuthService) {}

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.auth.login(dto.email, dto.password);
  }

  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('send-otp')
  sendOtp(@Body() dto: SendOtpDto) {
    return this.auth.sendOtp(dto.identifier);
  }

  @Throttle({ default: { limit: 5, ttl: 300000 } })
  @Post('verify-otp')
  verifyOtp(@Body() dto: VerifyOtpDto) {
    return this.auth.verifyOtp(dto.identifier, dto.otp);
  }

  @Post('refresh')
  refreshTokens(@Body() dto: RefreshDto) {
    return this.auth.refreshTokens(dto.userId, dto.role);
  }
}
