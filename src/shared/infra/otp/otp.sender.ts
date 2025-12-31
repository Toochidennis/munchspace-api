export type OtpChannel = 'EMAIL' | 'PHONE';

export interface OtpSender {
  sendOtp(input: {
    channel: OtpChannel;
    destination: string;
    message: string;
  }): Promise<void>;
}
