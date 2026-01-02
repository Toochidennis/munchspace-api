import { Module } from '@nestjs/common';
import { CustomerService } from '@/modules/customers/customer.service';
import { CustomerController } from '@/modules/customers/customer.controller';
import { OtpModule } from '@/shared/infra/otp/otp.module';
import { AuthModule } from '@/modules/auth/auth.module';

@Module({
  imports: [OtpModule, AuthModule],
  controllers: [CustomerController],
  providers: [CustomerService],
  exports: [],
})
export class CustomerModule {}
