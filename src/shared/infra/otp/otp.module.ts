import { Module } from '@nestjs/common';
import { OtpService } from '@/shared/infra/otp/otp.service';
import { PrismaOtpStore } from '@/shared/infra/otp/stores/prisma-otp.store';
import { OTP_SENDER, OTP_STORE } from '@/shared/tokens/otp.tokens';
import { SmsOtpSender } from '@/shared/infra/otp/senders/sms-otp.sender';
import { OtpSenderRouter } from './otp.sender.router';
import { EmailOtpSender } from './senders/email-otp.sender';

@Module({
  imports: [],
  providers: [
    OtpService,
    PrismaOtpStore,
    EmailOtpSender,
    SmsOtpSender,
    OtpSenderRouter,
    {
      provide: OTP_SENDER,
      useClass: OtpSenderRouter,
    },
    {
      provide: OTP_STORE,
      useClass: PrismaOtpStore,
    },
  ],
  exports: [OtpService],
})
export class OtpModule {}
