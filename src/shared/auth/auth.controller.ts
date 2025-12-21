import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  LoginDto,
  SendOtpDto,
  VerifyOtpDto,
  CustomerSignupDto,
} from './dto';

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

  @Post('customer/send-otp')
  sendCustomerOtp(@Body() dto: SendOtpDto) {
    return this.auth.sendOtp(dto.phone);
  }

  @Post('customer/verify-otp')
  verifyCustomerOtp(@Body() dto: VerifyOtpDto) {
    return this.auth.verifyOtp(dto.phone, dto.otp);
  }
}
