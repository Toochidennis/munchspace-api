import { Controller, Post, HttpCode, HttpStatus } from '@nestjs/common';
import { CustomerService } from '@/modules/customers/customer.service';
import { Body } from '@nestjs/common';
import { CreateCustomerDto } from '@/modules/customers/dto/create-customer.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { ApiAuthApiKey } from '@/shared/decorators/swagger-auth.decorators';
import { UseApiKey } from '@/shared/decorators/use-api-key.decorator';

@ApiTags('Customers')
@ApiAuthApiKey()
@UseApiKey()
@Controller('customer')
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @ApiOperation({
    summary: 'Create customer',
    description: 'Register a new customer. Requires x-api-key header.',
  })
  @ApiResponse({
    status: 201,
    description: 'Customer created successfully',
    schema: {
      example: {
        customerId: 'cuid_example_123',
        name: 'John Doe',
        email: 'john.doe@example.com',
        phone: '+2348012345678',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Invalid or missing API key' })
  @ApiBody({ type: CreateCustomerDto })
  @Post('signup')
  createCustomer(@Body() customerData: CreateCustomerDto) {
    // return await this.customerService.storeCustomerData(customerData);
  }
}
