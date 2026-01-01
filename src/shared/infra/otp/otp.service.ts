import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { OtpGenerator } from './otp.generator';
import { OTP_SENDER, OTP_STORE } from '@/shared/tokens/otp.tokens';
import type { OtpStore } from '@/modules/auth/types/otp-store.type';
import type { OtpSender } from './otp.sender';

@Injectable()
export class OtpService {
  constructor(
    @Inject(OTP_SENDER) private readonly sender: OtpSender,
    @Inject(OTP_STORE) private readonly store: OtpStore,
  ) {}

  async send(input: {
    userId: string;
    channel: 'EMAIL' | 'PHONE';
    destination: string;
  }) {
    const canResend = await this.store.canResend(input.userId, input.channel);

    if (!canResend) {
      throw new BadRequestException(
        'OTP recently sent. Please wait before retrying.',
      );
    }

    const otp = OtpGenerator.generate();

    await this.store.save({
      userId: input.userId,
      channel: input.channel,
      otp,
      ttlMinutes: 5,
      resendCooldownSeconds: 60,
    });

    const message = `Your MunchSpace verification code is ${otp}. Expires in 5 minutes.`;
    console.log(message);

    // await this.sender.sendOtp({
    //   channel: input.channel,
    //   destination: input.destination,
    //   message,
    // });

    if (process.env.NODE_ENV !== 'production') {
      console.log('[DEV OTP]', otp, '→', input.destination);
    }
  }

  async verify(input: {
    userId: string;
    channel: 'EMAIL' | 'PHONE';
    otp: string;
  }) {
    const ok = await this.store.verify({
      userId: input.userId,
      channel: input.channel,
      otp: input.otp,
      maxAttempts: 5,
    });

    if (!ok) {
      throw new BadRequestException('Invalid or expired OTP');
    }

    await this.store.clear(input.userId, input.channel);
  }
}
