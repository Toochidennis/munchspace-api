import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { OtpGenerator } from '@/shared/infra/otp/otp.generator';
import { OtpSender } from '@/shared/infra/otp/otp.sender';
import { OTP_SENDER, OTP_STORE } from '@/shared/tokens/otp.tokens';
import type { OtpStore } from '@/modules/auth/types/otp-store.type';

@Injectable()
export class OtpService {
  constructor(
    @Inject(OTP_SENDER) private readonly otpSender: OtpSender,
    @Inject(OTP_STORE) private readonly otpStore: OtpStore,
  ) {}

  async send(input: {
    userId: string;
    channel: 'EMAIL' | 'PHONE';
    destination: string;
  }) {
    const canResend = await this.otpStore.canResend(
      input.userId,
      input.channel,
    );

    if (!canResend) {
      throw new BadRequestException(
        'OTP recently sent. Please wait before retrying.',
      );
    }

    const otp = OtpGenerator.generate();

    await this.otpStore.save({
      userId: input.userId,
      channel: input.channel,
      otp,
      ttlMinutes: 5,
      resendCooldownSeconds: 60,
    });

    const message = `Your verification code is: ${otp}. It will expire in 5 minutes.`;

    await this.otpSender.sendOtp(input.destination, message);

    if (process.env.NODE_ENV !== 'production') {
      console.log('[DEV OTP]', otp, '→', input.destination);
    }
  }

  async verify(input: {
    userId: string;
    channel: 'EMAIL' | 'PHONE';
    otp: string;
  }) {
    const ok = await this.otpStore.verify({
      userId: input.userId,
      channel: input.channel,
      otp: input.otp,
      maxAttempts: 5,
    });

    console.log('OTP verification result for user', input.userId, ':', ok);

    if (!ok) {
      throw new BadRequestException('Invalid OTP or expired OTP');
    }

    await this.otpStore.clear(input.userId, input.channel);
  }
}
