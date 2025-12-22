export abstract class OtpSender {
  abstract sendOtp(destination: string, message: string): Promise<void>;
}
