export interface OtpStore {
  save(input: {
    userId: string;
    channel: 'EMAIL' | 'PHONE';
    otp: string;
    ttlMinutes: number;
    resendCooldownSeconds: number;
  }): Promise<void>;

  verify(input: {
    userId: string;
    channel: 'EMAIL' | 'PHONE';
    otp: string;
    maxAttempts: number;
  }): Promise<boolean>;

  clear(userId: string, channel: 'EMAIL' | 'PHONE'): Promise<void>;

  canResend(userId: string, channel: 'EMAIL' | 'PHONE'): Promise<boolean>;
}
