import { Module } from '@nestjs/common';
import { AuthService } from '@/modules/auth/auth.service';
import { AuthController } from '@/modules/auth/auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AccessJwtStrategy } from '@/modules/auth/strategies/access-jwt.strategy';
import { RefreshJwtStrategy } from '@/modules/auth/strategies/refresh-jwt.strategy';
import { TokenUtil } from '@/modules/auth/token.util';
import { OtpModule } from '@/shared/infra/otp/otp.module';

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
  providers: [AuthService, AccessJwtStrategy, RefreshJwtStrategy, TokenUtil],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
