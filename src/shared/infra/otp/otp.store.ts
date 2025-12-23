import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import { addMinutes, isAfter } from 'date-fns';
import { Prisma } from '@prisma/client';

@Injectable()
export class OtpStore {
  constructor(private readonly prisma: PrismaService) {}

  async save(
    userId: string,
    otp: string,
    ttlMinutes = 5,
    tsx?: Prisma.TransactionClient,
  ) {
    const otpHash = await bcrypt.hash(otp, 10);
    const prismaClient = tsx || this.prisma.client;

    return prismaClient.otp.upsert({
      where: { userId },
      update: {
        otpHash,
        expiresAt: addMinutes(new Date(), ttlMinutes),
      },
      create: {
        userId,
        otpHash,
        expiresAt: addMinutes(new Date(), ttlMinutes),
      },
    });
  }

  async verify(userId: string, plainOtp: string): Promise<boolean> {
    const otpRecord = await this.prisma.client.otp.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    if (!otpRecord) return false;
    if (isAfter(new Date(), otpRecord.expiresAt)) return false;

    return bcrypt.compare(plainOtp, otpRecord.otpHash);
  }

  async clear(userId: string) {
    await this.prisma.client.otp.deleteMany({ where: { userId } });
  }
}
