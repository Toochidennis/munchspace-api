import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsArray,
  IsPhoneNumber,
  IsString,
  IsDate,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCustomerDto {
  @ApiProperty({
    description: 'Customer full name',
    example: 'John Doe',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Customer email address',
    example: 'john.doe@example.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'Customer phone number in international format',
    example: '+2348012345678',
  })
  @IsPhoneNumber()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({
    description: 'List of order IDs associated with the customer',
    example: ['order_123', 'order_456'],
    required: false,
  })
  @IsOptional()
  @IsArray()
  orders?: string[];

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2024-01-01T00:00:00.000Z',
    required: false,
  })
  @IsOptional()
  @IsDate()
  updatedAt?: Date;
}
