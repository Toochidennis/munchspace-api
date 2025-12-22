import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { OtpGenerator } from '@/shared/infra/otp/otp.generator';
import { OtpSender } from '@/shared/infra/otp/otp.sender';
import { OtpStore } from '@/shared/infra/otp/otp.store';
import { OTP_SENDER } from '@/shared/infra/otp/otp.tokens';

@Injectable()
export class OtpService {
  constructor(
    @Inject(OTP_SENDER) private readonly otpSender: OtpSender,
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
