import { Module } from '@nestjs/common';
import { AuthService } from '@/shared/auth/auth.service';
import { AuthController } from '@/shared/auth/auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { JwtStrategy } from '@/shared/auth/strategies/jwt.strategy';
import { TokenUtil } from '@/shared/auth/token.util';
import { OtpModule } from '@/shared/infra/otp/otp.module';

@Module({
  imports: [
    JwtModule.registerAsync({
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '1h' },
      }),
      inject: [ConfigService],
    }),
    OtpModule,
  ],
  providers: [AuthService, JwtStrategy, TokenUtil],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
