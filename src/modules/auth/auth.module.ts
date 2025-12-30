import { Module } from '@nestjs/common';
import { AuthService } from '@/modules/auth/auth.service';
import { AuthController } from '@/modules/auth/auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AccessJwtStrategy } from '@/modules/auth/strategies/access-jwt.strategy';
import { RefreshJwtStrategy } from '@/modules/auth/strategies/refresh-jwt.strategy';
import { TokenUtil } from '@/modules/auth/token.util';
import { OtpModule } from '@/shared/infra/otp/otp.module';
import { API_KEY_RESOLVER } from '@/shared/tokens/api-key-resolver.token';
import { EnvApiKeyResolver } from '@/modules/auth/resolvers/env-api-key.resolver.';
import { ApiKeyGuard } from '@/shared/guards/api-key.guard';

@Module({
  imports: [
    JwtModule.registerAsync({
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET'),
      }),
      inject: [ConfigService],
    }),
    OtpModule,
  ],
  providers: [
    ApiKeyGuard,
    AuthService,
    AccessJwtStrategy,
    RefreshJwtStrategy,
    TokenUtil,
    {
      provide: API_KEY_RESOLVER,
      useClass: EnvApiKeyResolver,
    },
  ],
  controllers: [AuthController],
  exports: [AuthService, ApiKeyGuard, API_KEY_RESOLVER],
})
export class AuthModule {}
