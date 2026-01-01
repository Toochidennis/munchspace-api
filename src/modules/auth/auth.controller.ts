import {
  Controller,
  Post,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
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
import {
  ApiAuthApiKey,
  ApiAuthBearer,
} from '@/shared/decorators/swagger-auth.decorators';
import { ApiBody, ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AccessJwtGuard } from '@/shared/guards/access-jwt.guard';
import { User } from './decorators/user.decorator';

@ApiTags('Authentication')
@ApiAuthApiKey()
@UseApiKey()
@Controller({ path: 'auth', version: '1' })
export class AuthController {
  constructor(private auth: AuthService) {}

  @ApiOperation({
    summary: 'User signup',
    description:
      'Create a new user account. Requires x-api-key header with valid client type (CUSTOMER, VENDOR, RIDER, ADMIN).',
  })
  @ApiResponse({
    status: 201,
    description: 'User successfully registered',
    schema: {
      example: {
        userId: 'cuid_example_123',
        email: 'john.doe@example.com',
        phone: '+2348012345678',
        message: 'User registered successfully',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 409, description: 'User already exists' })
  @ApiResponse({ status: 401, description: 'Invalid or missing API key' })
  @ApiBody({ type: SignupDto })
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('signup')
  async signup(@Body() dto: SignupDto, @Client() clientType: ClientType) {
    return this.auth.signup(dto, clientType);
  }

  @ApiOperation({
    summary: 'User login',
    description:
      'Authenticate user with email and password. Returns access and refresh tokens.',
  })
  @ApiResponse({
    status: 200,
    description: 'Login successful',
    schema: {
      example: {
        accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  @ApiBody({ type: LoginDto })
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('login')
  async login(@Body() dto: LoginDto) {
    return this.auth.login(dto.email, dto.password);
  }

  @ApiOperation({
    summary: 'Request OTP',
    description:
      'Send OTP code to user via email or SMS. Rate limited to 5 requests per minute.',
  })
  @ApiResponse({
    status: 200,
    description: 'OTP sent successfully',
    schema: {
      example: {
        message: 'OTP sent successfully',
        expiresIn: 600,
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid email or phone number' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  @ApiBody({ type: SendOtpDto })
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('otp/request')
  async sendOtp(@Body() dto: SendOtpDto) {
    return this.auth.sendOtp(dto.identifier);
  }

  @ApiOperation({
    summary: 'Verify OTP',
    description:
      'Verify OTP code and authenticate user. Returns access and refresh tokens on success.',
  })
  @ApiResponse({
    status: 200,
    description: 'OTP verified successfully',
    schema: {
      example: {
        accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Invalid or expired OTP' })
  @ApiBody({ type: VerifyOtpDto })
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 5, ttl: 300000 } })
  @Post('otp/verify')
  async verifyOtp(@Body() dto: VerifyOtpDto) {
    return this.auth.verifyOtp(dto);
  }

  @ApiOperation({
    summary: 'Refresh access token',
    description: 'Get a new access token using a valid refresh token.',
  })
  @ApiResponse({
    status: 200,
    description: 'Token refreshed successfully',
    schema: {
      example: {
        accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Invalid or expired refresh token' })
  @ApiBody({ type: RefreshTokenDto })
  @HttpCode(HttpStatus.OK)
  @Post('token/refresh')
  async refreshToken(@Body() dto: RefreshTokenDto) {
    return this.auth.refreshToken(dto.refreshToken);
  }

  @ApiOperation({
    summary: 'Logout',
    description: 'Logout user by invalidating the refresh token.',
  })
  @ApiResponse({
    status: 200,
    description: 'Logout successful',
    schema: {
      example: {
        message: 'Logout successful',
      },
    },
  })
  @ApiBody({ type: RefreshTokenDto })
  @HttpCode(HttpStatus.OK)
  @Post('logout')
  async logout(@Body() dto: RefreshTokenDto) {
    return this.auth.logout(dto.refreshToken);
  }

  @ApiOperation({
    summary: 'Revoke refresh token',
    description: 'Revoke a specific refresh token.',
  })
  @ApiResponse({ status: 200, description: 'Token revoked successfully' })
  @ApiBody({ type: RefreshTokenDto })
  @HttpCode(HttpStatus.OK)
  @Post('token/revoke')
  async revokeRefreshToken(@Body() dto: RefreshTokenDto) {
    return this.auth.revokeRefreshToken(dto.refreshToken);
  }

  @ApiOperation({
    summary: 'Revoke all refresh tokens',
    description: 'Revoke all refresh tokens system-wide. Admin operation.',
  })
  @ApiResponse({ status: 200, description: 'All tokens revoked successfully' })
  @HttpCode(HttpStatus.OK)
  @Post('token/revoke/all')
  async revokeAllRefreshTokens() {
    return this.auth.revokeAllTokens();
  }

  @ApiAuthBearer()
  @UseGuards(AccessJwtGuard)
  @ApiOperation({
    summary: 'Revoke all user tokens',
    description:
      'Revoke all refresh tokens for the authenticated user. Requires bearer token.',
  })
  @ApiResponse({
    status: 200,
    description: 'All user tokens revoked successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @HttpCode(HttpStatus.OK)
  @Post('token/revoke/user')
  async revokeAllUserTokens(@User('userId') userId: string) {
    return this.auth.revokeAllTokensByUser(userId);
  }
}
