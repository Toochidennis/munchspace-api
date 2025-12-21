import { BadRequestException, Injectable } from '@nestjs/common';
import { OtpGenerator } from './otp.generator';
import type { OtpSender } from './otp.sender';
import { OtpStore } from './otp.store';

@Injectable()
export class OtpService {
  constructor(
    private readonly otpSender: OtpSender,
    private readonly otpStore: OtpStore,
  ) {}

  async send(userId: string, destination: string): Promise<void> {
    const otp = OtpGenerator.generate();

    await this.otpStore.save(userId, otp);

    const message = `Your verification code is: ${otp}. It will expire in 5 minutes.`;

    await this.otpSender.sendOtp(destination, message);

    // Development only: log the OTP
    if (process.env.NODE_ENV !== 'production') {
      console.log('[DEV OTP]', otp);
    }
  }

  async verify(userId: string, otp: string): Promise<void> {
    const isValid = await this.otpStore.verify(userId, otp);

    if (!isValid) {
      throw new BadRequestException('Invalid or expired OTP');
    }

    await this.otpStore.clear(userId);
  }
}
