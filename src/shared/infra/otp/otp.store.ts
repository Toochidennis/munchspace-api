import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import { addMinutes, isAfter } from 'date-fns';

@Injectable()
export class OtpStore {
  constructor(private prisma: PrismaService) {}

  async save(userId: string, otp: string, ttlMinutes = 5) {
    const otpHash = await bcrypt.hash(otp, 10);

    return this.prisma.otp.create({
      data: {
        userId,
        otpHash,
        expiresAt: addMinutes(new Date(), ttlMinutes),
      },
    });
  }

  async verify(userId: string, plainOtp: string): Promise<boolean> {
    const otpRecord = await this.prisma.otp.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    if (!otpRecord) return false;
    if (isAfter(new Date(), otpRecord.expiresAt)) return false;

    return bcrypt.compare(plainOtp, otpRecord.otpHash);
  }

  async clear(userId: string) {
    await this.prisma.otp.deleteMany({ where: { userId } });
  }
}
