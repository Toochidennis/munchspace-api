import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { TokenUtil } from './token.util';
import { OtpService } from '../infra/otp/otp.service';
import { PrismaService } from '@/shared/infra/prisma/prisma.service';
import { AuthMethod } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    public prisma: PrismaService,
    private tokenUtil: TokenUtil,
    private readonly otpService: OtpService,
  ) {}

  async validatePasswordLogin(email: string, password: string) {
    const user = await this.prisma.client.user.findUnique({ where: { email } });

    if (!user) throw new UnauthorizedException('Invalid credentials');
    if (!user.passwordHash) throw new UnauthorizedException('No password set');

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) throw new UnauthorizedException('Invalid credentials');
    return user;
  }

  async login(email: string, password: string) {
    const user = await this.validatePasswordLogin(email, password);

    if (user.authMethods.includes(AuthMethod.EMAIL_OTP)) {
      await this.otpService.send(user.id, user.email);
      return { next: 'otp_sent' };
    }

    return this.issueTokens(user.id, user.role);
  }

  async sendOtp(identifier: string) {
    const user = await this.findUserByEmailOrPhone(identifier);
    if (!user) throw new BadRequestException('User not found');

    if (user.authMethods.includes(AuthMethod.SMS_OTP)) {
      await this.otpService.send(user.id, identifier);
    }

    if (user.authMethods.includes(AuthMethod.EMAIL_OTP)) {
      await this.otpService.send(user.id, identifier);
    }

    return { message: 'OTP sent' };
  }

  async verifyOtp(identifier: string, otp: string) {
    const user = await this.findUserByEmailOrPhone(identifier);
    if (!user) throw new BadRequestException('User not found');

    await this.otpService.verify(user.id, otp);

    return this.issueTokens(user.id, user.role);
  }

  async validateUserById(userId: string) {
    return await this.prisma.client.user.findUnique({ where: { id: userId } });
  }

  async findUserByEmailOrPhone(identifier: string) {
    return await this.prisma.client.user.findFirst({
      where: {
        OR: [{ email: identifier }, { phone: identifier }],
      },
    });
  }

  issueTokens(userId: string, role: string) {
    return {
      accessToken: this.tokenUtil.generateAccessToken(userId, role),
      refreshToken: this.tokenUtil.generateRefreshToken(userId, role),
    };
  }
}
