import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { TokenUtil } from '@/modules/auth/token.util';
import { OtpService } from '@/shared/infra/otp/otp.service';
import { PrismaService } from '@/shared/infra/prisma/prisma.service';
import { AuthMethod, User } from '@prisma/client';
import { SignupDto, VerifyOtpDto } from '@/modules/auth/dto';
import { ClientType } from '@/modules/auth/types/client-type.type';
import { hashToken } from '@/modules/auth/token-hash.util';
import { addDays } from 'date-fns';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tokenUtil: TokenUtil,
    private readonly otpService: OtpService,
  ) {}

  async signup(dto: SignupDto, clientType: ClientType) {
    const existing = await this.prisma.client.user.findFirst({
      where: {
        OR: [{ email: dto.email }, { phone: dto.phone }],
      },
    });

    if (existing) {
      throw new ConflictException(
        'User with provided email or phone already exists',
      );
    }

    const authMethods = new Set<AuthMethod>();

    authMethods.add(
      this.allowedOtpChannel(clientType) === 'EMAIL'
        ? AuthMethod.EMAIL_OTP
        : AuthMethod.SMS_OTP,
    );

    if (clientType === 'VENDOR' || clientType === 'ADMIN') {
      if (!dto.password) {
        throw new BadRequestException(
          'Password is required for this client type',
        );
      }
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
        signupClientType: clientType,
      },
    });

    return await this.dispatchOtp(user);
  }

  private allowedOtpChannel(clientType: ClientType): 'EMAIL' | 'PHONE' {
    if (clientType === 'CUSTOMER') return 'PHONE';
    return 'EMAIL';
  }

  private getPrimaryOtpChannel(user: User): 'EMAIL' | 'PHONE' {
    if (user.authMethods.includes(AuthMethod.SMS_OTP)) return 'PHONE';
    if (user.authMethods.includes(AuthMethod.EMAIL_OTP)) return 'EMAIL';
    throw new BadRequestException('No OTP method configured');
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
      return await this.dispatchOtp(user);
    }

    return this.issueTokens(user.id);
  }

  async logout(refreshToken: string) {
    await this.prisma.client.refreshToken.updateMany({
      where: {
        tokenHash: hashToken(refreshToken),
        revoked: false,
      },
      data: { revoked: true },
    });
  }

  async sendOtp(identifier: string) {
    const user = await this.findUserByEmailOrPhone(identifier);
    if (!user) throw new BadRequestException('User not found');

    if (!user.isActive || user.isBlocked) {
      throw new UnauthorizedException('Account disabled');
    }

    return await this.dispatchOtp(user);
  }

  async verifyOtp(dto: VerifyOtpDto) {
    const user = await this.findUserByEmailOrPhone(dto.identifier);

    if (!user) throw new BadRequestException('User not found');

    const channel = this.getPrimaryOtpChannel(user);

    await this.otpService.verify({
      userId: user.id,
      channel: channel,
      otp: dto.otp,
    });

    if (channel === 'EMAIL') user.emailVerified = true;
    if (channel === 'PHONE') user.phoneVerified = true;

    user.isVerified =
      (user.emailVerified || !user.email) &&
      (user.phoneVerified || !user.phone);

    await this.prisma.client.user.update({
      where: { id: user.id },
      data: {
        emailVerified: user.emailVerified,
        phoneVerified: user.phoneVerified,
        isVerified: user.emailVerified && user.phoneVerified,
      },
    });

    const isSignupFlow = Boolean(user.signupClientType);

    if (isSignupFlow) {
      if (user.signupClientType === 'CUSTOMER') {
        const existingCustomer = await this.prisma.client.customer.findUnique({
          where: { userId: user.id },
        });

        if (!existingCustomer) {
          await this.prisma.client.customer.create({
            data: {
              userId: user.id,
              firstName: user.firstName,
              lastName: user.lastName,
              email: user.email,
              phone: user.phone,
            },
          });
        }
      }

      if (user.signupClientType === 'VENDOR') {
        const existingVendor = await this.prisma.client.vendor.findUnique({
          where: { userId: user.id },
        });

        if (!existingVendor) {
          const vendor = await this.prisma.client.vendor.create({
            data: {
              userId: user.id,
              legalName: `${user.firstName} ${user.lastName}`,
              displayName: user.firstName,
              supportEmail: user.email,
              supportPhone: user.phone,
              address: 'PENDING',
            },
          });

          await this.prisma.client.vendorUser.create({
            data: {
              userId: user.id,
              vendorId: vendor.id,
              role: 'OWNER',
            },
          });
        }
      }

      // cleanup only for signup
      await this.prisma.client.user.update({
        where: { id: user.id },
        data: { signupClientType: null },
      });
    }

    return this.issueTokens(user.id);
  }

  private async dispatchOtp(user: User) {
    const primary = this.getPrimaryOtpChannel(user);

    const channels: Array<{
      channel: 'EMAIL' | 'PHONE';
      destination: string;
    }> = [];

    if (primary === 'EMAIL' && user.email) {
      channels.push({ channel: 'EMAIL', destination: user.email });
    }

    if (primary === 'PHONE' && user.phone) {
      channels.push({ channel: 'PHONE', destination: user.phone });
    }

    // // optional secondary
    // if (primary !== 'EMAIL' && user.email) {
    //   channels.push({ channel: 'EMAIL', destination: user.email });
    // }

    // if (primary !== 'PHONE' && user.phone) {
    //   channels.push({ channel: 'PHONE', destination: user.phone });
    // }

    for (const ch of channels) {
      await this.otpService.send({
        userId: user.id,
        channel: ch.channel,
        destination: ch.destination,
      });
    }

    return {
      message: 'otp_sent',
    };
  }

  async refreshToken(refreshToken: string) {
    const tokenHash = hashToken(refreshToken);

    const stored = await this.prisma.client.refreshToken.findFirst({
      where: {
        tokenHash,
        revoked: false,
        expiresAt: { gt: new Date() },
      },
    });

    if (!stored) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    await this.prisma.client.refreshToken.update({
      where: { id: stored.id },
      data: { revoked: true },
    });

    return this.issueTokens(stored.userId);
  }

  async revokeRefreshToken(refreshToken: string) {
    await this.prisma.client.refreshToken.updateMany({
      where: {
        tokenHash: hashToken(refreshToken),
        revoked: false,
      },
      data: { revoked: true },
    });
  }

  async revokeAllTokens() {
    await this.prisma.client.refreshToken.updateMany({
      where: {
        revoked: false,
      },
      data: { revoked: true },
    });
  }

  async revokeAllTokensByUser(userId: string) {
    await this.prisma.client.refreshToken.updateMany({
      where: {
        userId,
        revoked: false,
      },
      data: { revoked: true },
    });
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

    const accessToken = this.tokenUtil.generateAccessToken(payload);
    const refreshToken = this.tokenUtil.generateRefreshToken(payload);

    await this.prisma.client.refreshToken.create({
      data: {
        userId,
        tokenHash: hashToken(refreshToken),
        expiresAt: addDays(new Date(), 14),
      },
    });

    return {
      accessToken: accessToken,
      refreshToken: refreshToken,
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
