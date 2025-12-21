import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from 'src/shared/infra/prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import { TokenUtil } from './token.util';
import { OtpService } from '../infra/otp/otp.service';

@Injectable()
export class AuthService {
  constructor(
    public prisma: PrismaService,
    private tokenUtil: TokenUtil,
    private readonly otpService: OtpService,
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
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        phone: user.phone,
      },
      accessToken: this.tokenUtil.generateAccessToken(user),
      refreshToken: this.tokenUtil.generateRefreshToken(user),
    };
  }

  async sendOtp(phone: string) {
    const user = await this.prisma.user.findUnique({ where: { phone } });
    if (!user) throw new BadRequestException('User not found');

    await this.otpService.send(user.id, phone);

    return { message: 'OTP sent' };
  }

  async verifyOtp(phone: string, plainOtp: string) {
    const user = await this.prisma.user.findUnique({ where: { phone } });
    if (!user) throw new BadRequestException('User not found');

    await this.otpService.verify(user.id, plainOtp);

    return {
      user,
      accessToken: this.tokenUtil.generateAccessToken(user),
      refreshToken: this.tokenUtil.generateRefreshToken(user),
    };
  }

  async validateUserById(userId: string) {
    return await this.prisma.user.findUnique({ where: { id: userId } });
  }
}
