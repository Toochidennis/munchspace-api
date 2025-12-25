import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { TokenUtil } from '@/modules/auth/token.util';
import { OtpService } from '@/shared/infra/otp/otp.service';
import { PrismaService } from '@/shared/infra/prisma/prisma.service';
import { AuthMethod } from '@prisma/client';
import { JwtPayload } from '@/modules/auth/types/jwt-payload.type';
import { SignupDto } from '@/modules/auth/dto';
import { ClientType } from './types/client-type.type';

@Injectable()
export class AuthService {
  constructor(
    public prisma: PrismaService,
    private tokenUtil: TokenUtil,
    private readonly otpService: OtpService,
  ) {}

  async signup(dto: SignupDto, clientType: ClientType) {
    const existing = await this.prisma.client.user.findFirst({
      where: {
        OR: [{ email: dto.email }, { phone: dto.phone }],
      },
    });

    if (existing) {
      throw new BadRequestException(
        'User with provided email or phone already exists',
      );
    }

    const authMethods = new Set<AuthMethod>();

    authMethods.add(
      this.resolveOtpChannel(clientType) === 'EMAIL'
        ? AuthMethod.EMAIL_OTP
        : AuthMethod.SMS_OTP,
    );
    if (dto.password) {
      authMethods.add(AuthMethod.PASSWORD);
    }

    const user = await this.prisma.client.user.create({
      data: {
        email: dto.email,
        phone: dto.phone,
        firstName: dto.firstName,
        lastName: dto.lastName || '',
        passwordHash: dto.password ? await bcrypt.hash(dto.password, 10) : null,
        authMethods: Array.from(authMethods),
        isVerified: false,
      },
    });

    await this.prisma.client.user.update({
      where: { id: user.id },
      data: {
        signupClientType: clientType,
      },
    });

    return await this.dispatchOtp(clientType, user);
  }

  private resolveOtpChannel(clientType: ClientType): 'EMAIL' | 'PHONE' {
    if (clientType === 'CUSTOMER') return 'PHONE';
    return 'EMAIL';
  }

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

  async sendOtp(identifier: string, clientType: ClientType) {
    const user = await this.findUserByEmailOrPhone(identifier);
    if (!user) throw new BadRequestException('User not found');

    if (!user.isActive || user.isBlocked) {
      throw new UnauthorizedException('Account disabled');
    }

    return await this.dispatchOtp(clientType, user);
  }

  async verifyOtp(identifier: string, otp: string) {
    const user = await this.findUserByEmailOrPhone(identifier);
    if (!user) throw new BadRequestException('User not found');

    await this.otpService.verify(user.id, otp);

    return this.issueTokens(user.id);
  }

  private async dispatchOtp(
    clientType: ClientType,
    user: {
      id: string;
      email: string;
      phone: string;
      authMethods: AuthMethod[];
    },
  ) {
    const primaryChannel = this.resolveOtpChannel(clientType);

    if (
      primaryChannel === 'PHONE' &&
      !user.authMethods.includes(AuthMethod.SMS_OTP)
    ) {
      throw new UnauthorizedException('SMS OTP not enabled for this account');
    }

    if (
      primaryChannel === 'EMAIL' &&
      !user.authMethods.includes(AuthMethod.EMAIL_OTP)
    ) {
      throw new UnauthorizedException('Email OTP not enabled for this account');
    }

    if (primaryChannel === 'PHONE') {
      await this.otpService.send(user.id, user.phone);
    } else {
      await this.otpService.send(user.id, user.email);
    }

    //optional secondary channels
    if (primaryChannel !== 'EMAIL' && user.email) {
      await this.otpService.send(user.id, user.email);
    }

    if (primaryChannel !== 'PHONE' && user.phone) {
      await this.otpService.send(user.id, user.phone);
    }

    return { message: 'otp_sent' };
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
