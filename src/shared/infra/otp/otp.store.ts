import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/shared/infra/prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import { addMinutes, isAfter } from 'date-fns';
import { OtpStore } from '@/modules/auth/types/otp-store.type';

@Injectable()
export class PrismaOtpStore implements OtpStore {
  constructor(private readonly prisma: PrismaService) {}

  async save(input: {
    userId: string;
    channel: 'EMAIL' | 'PHONE';
    otp: string;
    ttlMinutes: number;
    resendCooldownSeconds: number;
  }): Promise<void> {
    const otpHash = await bcrypt.hash(input.otp, 10);

    await this.prisma.client.otp.upsert({
      where: {
        userId_channel: {
          userId: input.userId,
          channel: input.channel,
        },
      },
      update: {
        otpHash,
        attempts: 0,
        expiresAt: addMinutes(new Date(), input.ttlMinutes),
        resendAt: addMinutes(new Date(), input.resendCooldownSeconds / 60),
      },
      create: {
        userId: input.userId,
        channel: input.channel,
        otpHash,
        attempts: 0,
        expiresAt: addMinutes(new Date(), input.ttlMinutes),
        resendAt: addMinutes(new Date(), input.resendCooldownSeconds / 60),
      },
    });

    console.log('OTP saved for user:', input.userId, 'channel:', input.channel);
  }

  async canResend(
    userId: string,
    channel: 'EMAIL' | 'PHONE',
  ): Promise<boolean> {
    const record = await this.prisma.client.otp.findUnique({
      where: {
        userId_channel: { userId, channel },
      },
    });

    if (!record) return true;

    return isAfter(new Date(), record.resendAt);
  }

  async verify(input: {
    userId: string;
    channel: 'EMAIL' | 'PHONE';
    otp: string;
    maxAttempts: number;
  }): Promise<boolean> {
    const record = await this.prisma.client.otp.findUnique({
      where: {
        userId_channel: {
          userId: input.userId,
          channel: input.channel,
        },
      },
    });

    console.log('OTP record found:', record);

    if (!record) return false;
    if (isAfter(new Date(), record.expiresAt)) return false;
    if (record.attempts >= input.maxAttempts) return false;

    const match = await bcrypt.compare(input.otp, record.otpHash);

    console.log('OTP match result:', match);

    await this.prisma.client.otp.update({
      where: { id: record.id },
      data: {
        attempts: { increment: 1 },
      },
    });

    return match;
  }

  async clear(userId: string, channel: 'EMAIL' | 'PHONE'): Promise<void> {
    await this.prisma.client.otp.delete({
      where: {
        userId_channel: { userId, channel },
      },
    });
  }
}
