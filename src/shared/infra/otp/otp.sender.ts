export interface OtpSender {
  sendOtp(destination: string, message: string): Promise<void>;
}
