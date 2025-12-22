import { Module } from '@nestjs/common';
import { OtpService } from '@/shared/infra/otp/otp.service';
import { OtpStore } from '@/shared/infra/otp/otp.store';
import { OTP_SENDER } from '@/shared/infra/otp/otp.tokens';
import { SmsOtpSender } from '@/shared/infra/otp/sms-otp-sender';

@Module({
  imports: [],
  providers: [
    OtpService,
    OtpStore,
    {
      provide: OTP_SENDER,
      useClass: SmsOtpSender,
    },
  ],
  exports: [OtpService],
})
export class OtpModule {}
