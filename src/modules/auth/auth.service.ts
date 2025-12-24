import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { TokenUtil } from './token.util';
import { OtpService } from '@/shared/infra/otp/otp.service';
import { PrismaService } from '@/shared/infra/prisma/prisma.service';
import { AuthMethod } from '@prisma/client';
import { JwtPayload } from './types/jwt-payload.type';

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

    if (!user.isActive || user.isBlocked) {
      throw new UnauthorizedException('Account disabled');
    }

    if (user.authMethods.includes(AuthMethod.EMAIL_OTP)) {
      await this.otpService.send(user.id, user.email);
      return { next: 'otp_sent' };
    }

    return this.issueTokens(user.id);
  }

  async sendOtp(identifier: string) {
    const user = await this.findUserByEmailOrPhone(identifier);
    if (!user) throw new BadRequestException('User not found');

    if (!user.isActive || user.isBlocked) {
      throw new UnauthorizedException('Account disabled');
    }

    if (user.authMethods.includes(AuthMethod.SMS_OTP)) {
      await this.otpService.send(user.id, identifier);
    }

    if (user.authMethods.includes(AuthMethod.EMAIL_OTP)) {
      await this.otpService.send(user.id, identifier);
    }

    return { message: 'otp_sent' };
  }

  async verifyOtp(identifier: string, otp: string) {
    const user = await this.findUserByEmailOrPhone(identifier);
    if (!user) throw new BadRequestException('User not found');

    await this.otpService.verify(user.id, otp);

    return this.issueTokens(user.id);
  }

  refreshTokens(payload: JwtPayload) {
    return {
      accessToken: this.tokenUtil.generateAccessToken(payload),
      refreshToken: this.tokenUtil.generateRefreshToken(payload),
    };
  }

  async findUserByEmailOrPhone(identifier: string) {
    return await this.prisma.client.user.findFirst({
      where: {
        OR: [{ email: identifier }, { phone: identifier }],
      },
    });
  }

  private async issueTokens(userId: string) {
    const capabilities = await this.buildCapabilities(userId);

    const payload = {
      sub: userId,
      capabilities,
    };

    return {
      accessToken: this.tokenUtil.generateAccessToken(payload),
      refreshToken: this.tokenUtil.generateRefreshToken(payload),
    };
  }

  private async buildCapabilities(userId: string) {
    const [customer, admin, rider, vendorUsers] = await Promise.all([
      this.prisma.client.customer.findUnique({ where: { userId } }),
      this.prisma.client.admin.findUnique({ where: { userId } }),
      this.prisma.client.rider.findUnique({ where: { userId } }),
      this.prisma.client.vendorUser.findMany({
        where: { userId, isActive: true },
        select: { vendorId: true },
      }),
    ]);

    return {
      customer: !!customer,
      admin: !!admin,
      rider: !!rider,
      vendorIds: vendorUsers.map((v) => v.vendorId),
    };
  }
}
