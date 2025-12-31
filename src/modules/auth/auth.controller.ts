import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import {
  LoginDto,
  SendOtpDto,
  SignupDto,
  VerifyOtpDto,
} from '@/modules/auth/dto';
import { AuthService } from '@/modules/auth/auth.service';
import { User } from '@/modules/auth/decorators/user.decorator';
import { RefreshJwtGuard } from '@/shared/guards/refresh-jwt.guard';
import type { AuthenticatedUser } from '@/modules/auth/types/authenticated-user.type';
import type { ClientType } from '@/modules/auth/types/client-type.type';
import { UseApiKey } from '@/shared/decorators/use-api-key.decorator';
import { Client } from '@/modules/auth/decorators/client.decorator';
import { ApiAuthApiKey } from '@/shared/decorators/swagger-auth.decorators';
import { ApiBody, ApiTags } from '@nestjs/swagger';

@ApiTags('Authentication', 'OTP')
@ApiAuthApiKey()
@UseApiKey()
@Controller({ path: 'auth', version: '1' })
export class AuthController {
  constructor(private auth: AuthService) {}

  @ApiBody({ type: SignupDto })
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('signup')
  signup(@Body() dto: SignupDto, @Client() clientType: ClientType) {
    return this.auth.signup(dto, clientType);
  }

  @ApiBody({ type: LoginDto })
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.auth.login(dto.email, dto.password);
  }

  @ApiBody({ type: SendOtpDto })
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('otp/request')
  sendOtp(@Body() dto: SendOtpDto) {
    return this.auth.sendOtp(dto.identifier);
  }

  @ApiBody({ type: VerifyOtpDto })
  @Throttle({ default: { limit: 5, ttl: 300000 } })
  @Post('otp/verify')
  verifyOtp(@Body() dto: VerifyOtpDto) {
    return this.auth.verifyOtp(dto);
  }

  @UseGuards(RefreshJwtGuard)
  @Post('token/refresh')
  refreshTokens(@User() user: AuthenticatedUser) {
    return this.auth.refreshTokens({
      sub: user.userId,
      capabilities: user.capabilities,
    });
  }
}
