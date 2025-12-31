import { Injectable } from '@nestjs/common';
import { OtpSender, OtpChannel } from '@/shared/infra/otp/otp.sender';
import { EmailOtpSender } from '@/shared/infra/otp/senders/email-otp.sender';
import { SmsOtpSender } from '@/shared/infra/otp/senders/sms-otp.sender';

@Injectable()
export class OtpSenderRouter implements OtpSender {
  constructor(
    private readonly emailSender: EmailOtpSender,
    private readonly smsSender: SmsOtpSender,
  ) {}

  async sendOtp(input: {
    channel: OtpChannel;
    destination: string;
    message: string;
  }): Promise<void> {
    if (input.channel === 'PHONE') {
      return this.smsSender.send(input.destination, input.message);
    }

    return this.emailSender.send(input.destination, input.message);
  }
}
