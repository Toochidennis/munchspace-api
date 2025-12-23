import { Controller, Post } from '@nestjs/common';
import { CustomerService } from '@/modules/customer/customer.service';
import { Body } from '@nestjs/common';
import { CreateCustomerDto } from '@/modules/customer/dto/create-customer.dto';

@Controller('customer')
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @Post('signup')
  async createCustomer(@Body() customerData: CreateCustomerDto) {
    return await this.customerService.storeCustomerData(customerData);
  }
}
