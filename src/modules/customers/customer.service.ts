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

}
