import { Injectable } from '@nestjs/common';

@Injectable()
export class SmsOtpSender {
  async send(destination: string, message: string): Promise<void> {
    // Replace with Termii / Twilio later
    console.log(`[SMS OTP] ${destination} → ${message}`);
  }
}
