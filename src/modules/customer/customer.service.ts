import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from '@/shared/infra/prisma/prisma.service';
import { OtpService } from '@/shared/infra/otp/otp.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { AuthMethod } from '@prisma/client';

@Injectable()
export class CustomerService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly otpService: OtpService,
  ) {}

  async storeCustomerData(
    customerData: CreateCustomerDto,
  ): Promise<{ next: string }> {
    const existingUser = await this.prisma.client.user.findUnique({
      where: { phone: customerData.phone },
    });

    if (existingUser) {
      throw new ConflictException('User with this phone number already exists');
    }

    return this.prisma.client.$transaction(async (tsx) => {
      const user = await tsx.user.create({
        data: {
          email: customerData.email,
          phone: customerData.phone,
          authMethods: [AuthMethod.SMS_OTP],
        },
      });

      await tsx.customer.create({
        data: {
          userId: user.id,
          name: customerData.name,
          email: customerData.email,
          phone: customerData.phone,
        },
      });

      await this.otpService.send(user.id, customerData.phone, tsx);

      return { next: 'otp_sent' };
    });
  }
}
