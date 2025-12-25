import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import {
  LoginDto,
  SendOtpDto,
  SignUpDto,
  VerifyOtpDto,
} from '@/modules/auth/dto';
import { AuthService } from '@/modules/auth/auth.service';
import { User } from '@/modules/auth/decorators/user.decorator';
import { RefreshJwtGuard } from '@/shared/guards/refresh-jwt.guard';
import type { AuthenticatedUser } from '@/modules/auth/types/authenticated-user.type';
import { ApiKeyGuard } from '@/shared/guards/api-key.guard';

@UseGuards(ApiKeyGuard)
@Controller('auth')
export class AuthController {
  constructor(private auth: AuthService) {}

  @Post('signup')
  signup(
    @Body() dto: SignUpDto,
    @Req() req: { clientType: 'CUSTOMER' | 'VENDOR' | 'RIDER' | 'ADMIN' },
  ) {
    return this.auth.signup(dto, req.clientType);
  }

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

  @UseGuards(RefreshJwtGuard)
  @Post('refresh')
  refreshTokens(@User() user: AuthenticatedUser) {
    return this.auth.refreshTokens({
      sub: user.userId,
      capabilities: user.capabilities,
    });
  }
}
