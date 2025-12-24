import { Module } from '@nestjs/common';
import { CustomerService } from '@/modules/customers/customer.service';
import { CustomerController } from '@/modules/customers/customer.controller';
import { OtpModule } from '@/shared/infra/otp/otp.module';

@Module({
  imports: [OtpModule],
  controllers: [CustomerController],
  providers: [CustomerService],
  exports: [CustomerService],
})
export class CustomerModule {}
