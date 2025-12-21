import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from 'src/shared/infra/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { TokenUtil } from './token.util';
import { addMinutes, isAfter } from 'date-fns';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private tokenUtil: TokenUtil,
  ) {}

  async validatePasswordLogin(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new UnauthorizedException('Invalid credentials');
    if (!user.password) throw new UnauthorizedException('No password set');
    const match = await bcrypt.compare(password, user.password);
    if (!match) throw new UnauthorizedException('Invalid credentials');
    return user;
  }

  async loginWithPassword(email: string, password: string) {
    const user = await this.validatePasswordLogin(email, password);
    return {
      accessToken: this.tokenUtil.generateAccessToken(user),
      refreshToken: this.tokenUtil.generateRefreshToken(user),
    };
  }

  async sendOtp(phone: string) {
    const user = await this.prisma.user.findUnique({ where: { phone } });
    if (!user) throw new BadRequestException('User not found');

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpHash = await bcrypt.hash(otp, 10);

    await this.prisma.oTp.create({
      data: { userId: user.id, otpHash, expiresAt: addMinutes(new Date(), 5) },
    });

    // TODO: send SMS
    return { message: 'OTP sent' };
  }

  async verifyOtp(phone: string, plainOtp: string) {
    const user = await this.prisma.user.findUnique({ where: { phone } });
    if (!user) throw new BadRequestException('User not found');

    const otpRecord = await this.prisma.oTp.findFirst({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
    });

    if (!otpRecord) throw new BadRequestException('No OTP found');

    if (isAfter(new Date(), otpRecord.expiresAt))
      throw new BadRequestException('OTP expired');

    const match = await bcrypt.compare(plainOtp, otpRecord.otpHash);
    if (!match) throw new BadRequestException('Invalid OTP');

    return {
      accessToken: this.tokenUtil.generateAccessToken(user),
      refreshToken: this.tokenUtil.generateRefreshToken(user),
    };
  }
}
