import { Controller, Post, Body } from '@nestjs/common';
import { LoginDto, SendOtpDto, VerifyOtpDto } from './dto';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service.js';

@Controller('auth')
export class AuthController {
  constructor(private auth: AuthService) {}

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.auth.login(dto.email, dto.password);
  }

  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('send-otp')
  sendCustomerOtp(@Body() dto: SendOtpDto) {
    return this.auth.sendOtp(dto.phone);
  }

  @Throttle({ default: { limit: 5, ttl: 300000 } })
  @Post('verify-otp')
  verifyCustomerOtp(@Body() dto: VerifyOtpDto) {
    return this.auth.verifyOtp(dto.phone, dto.otp);
  }
}
