import { Module } from '@nestjs/common';
import { CustomerService } from '@/modules/customer/customer.service';
import { CustomerController } from '@/modules/customer/customer.controller';
import { OtpModule } from '@/shared/infra/otp/otp.module';

@Module({
  imports: [OtpModule],
  controllers: [CustomerController],
  providers: [CustomerService],
  exports: [CustomerService],
})
export class CustomerModule {}
