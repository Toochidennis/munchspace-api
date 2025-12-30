import { Module } from '@nestjs/common';
import { OtpService } from '@/shared/infra/otp/otp.service';
import { PrismaOtpStore } from '@/shared/infra/otp/otp.store';
import { OTP_SENDER, OTP_STORE } from '@/shared/tokens/otp.tokens';
import { SmsOtpSender } from '@/shared/infra/otp/sms-otp-sender';

@Module({
  imports: [],
  providers: [
    OtpService,
    PrismaOtpStore,
    {
      provide: OTP_SENDER,
      useClass: SmsOtpSender,
    },
    {
      provide: OTP_STORE,
      useClass: PrismaOtpStore,
    },
  ],
  exports: [OtpService, OTP_STORE],
})
export class OtpModule {}
