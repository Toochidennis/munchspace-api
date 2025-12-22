import { Injectable } from '@nestjs/common';
import { OtpSender } from '@/shared/infra/otp/otp.sender';

@Injectable()
export class SmsOtpSender implements OtpSender {
  async sendOtp(destination: string, message: string): Promise<void> {
    // Implement SMS sending logic here, e.g., using Twilio or another SMS service
    console.log(`Sending OTP ${message} to phone number ${destination}`);
  }
}
