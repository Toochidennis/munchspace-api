import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import {
  LoginDto,
  SendOtpDto,
  SignupDto,
  VerifyOtpDto,
  RefreshTokenDto,
} from '@/modules/auth/dto';
import { AuthService } from '@/modules/auth/auth.service';
import type { ClientType } from '@/modules/auth/types/client-type.type';
import { UseApiKey } from '@/shared/decorators/use-api-key.decorator';
import { Client } from '@/modules/auth/decorators/client.decorator';
import { ApiAuthApiKey } from '@/shared/decorators/swagger-auth.decorators';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { AccessJwtGuard } from '@/shared/guards/access-jwt.guard';
import { User } from './decorators/user.decorator';

@ApiTags('Authentication', 'OTP')
@ApiAuthApiKey()
@UseApiKey()
@Controller({ path: 'auth', version: '1' })
export class AuthController {
  constructor(private auth: AuthService) {}

  @ApiBody({ type: SignupDto })
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('signup')
  async signup(@Body() dto: SignupDto, @Client() clientType: ClientType) {
    return this.auth.signup(dto, clientType);
  }

  @ApiBody({ type: LoginDto })
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('login')
  async login(@Body() dto: LoginDto) {
    return this.auth.login(dto.email, dto.password);
  }

  @ApiBody({ type: SendOtpDto })
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('otp/request')
  async sendOtp(@Body() dto: SendOtpDto) {
    return this.auth.sendOtp(dto.identifier);
  }

  @ApiBody({ type: VerifyOtpDto })
  @Throttle({ default: { limit: 5, ttl: 300000 } })
  @Post('otp/verify')
  async verifyOtp(@Body() dto: VerifyOtpDto) {
    return this.auth.verifyOtp(dto);
  }

  @Post('token/refresh')
  async refreshToken(@Body() dto: RefreshTokenDto) {
    return this.auth.refreshToken(dto.refreshToken);
  }

  @Post('logout')
  async logout(@Body() dto: RefreshTokenDto) {
    return this.auth.logout(dto.refreshToken);
  }

  @Post('token/revoke')
  async revokeRefreshToken(@Body() dto: RefreshTokenDto) {
    return this.auth.revokeRefreshToken(dto.refreshToken);
  }

  @Post('token/revoke/all')
  async revokeAllRefreshTokens() {
    return this.auth.revokeAllTokens();
  }

  @UseGuards(AccessJwtGuard)
  @Post('token/revoke/user')
  async revokeAllUserTokens(@User('userId') userId: string) {
    return this.auth.revokeAllTokensByUser(userId);
  }
}
