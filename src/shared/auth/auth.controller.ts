import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, SendOtpDto, VerifyOtpDto, CustomerSignupDto } from './dto';
import { Throttle } from '@nestjs/throttler';
import { ApiKeyGuard } from './guards/api-key.guard';

@Controller('auth')
export class AuthController {
  constructor(private auth: AuthService) {}

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.auth.loginWithPassword(dto.email, dto.password);
  }

  @Post('customer/signup')
  async customerSignup(@Body() dto: CustomerSignupDto) {
    const user = await this.auth.prisma.user.create({
      data: {
        email: dto.email,
        phone: dto.phone,
        role: 'USER',
        authType: 'OTP',
      },
    });

    return this.auth.sendOtp(dto.phone);
  }

  @UseGuards(ApiKeyGuard)
  @Throttle({ limit: 3, ttl: 60 })
  @Post('customer/send-otp')
  sendCustomerOtp(@Body() dto: SendOtpDto) {
    return this.auth.sendOtp(dto.phone);
  }

  @UseGuards(ApiKeyGuard)
  @Throttle({ limit: 5, ttl: 300 })
  @Post('customer/verify-otp')
  verifyCustomerOtp(@Body() dto: VerifyOtpDto) {
    return this.auth.verifyOtp(dto.phone, dto.otp);
  }
}
