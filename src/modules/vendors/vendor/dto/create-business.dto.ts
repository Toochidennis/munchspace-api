import {
  IsString,
  IsPhoneNumber,
  IsEmail,
  IsNotEmpty,
  IsDateString,
  IsOptional,
  IsArray,
  ValidateNested,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';
import { WorkingHourDto } from '@/modules/vendors/vendor/dto/working-hour.dto';
import { AddressDto } from '@/modules/vendors/vendor/dto/address.dto';
import { BrandType, BusinessType, ServiceOperation } from '@prisma/client';
import { Base64FileDto } from '@/shared/dto/file-upload.dto';
import { ApiProperty } from '@nestjs/swagger';

export class CreateBusinessDto {
  @ApiProperty({
    description: 'Legal business name as registered',
    example: 'Munchies Restaurant Ltd',
  })
  @IsString()
  @IsNotEmpty()
  legalName: string;

  @ApiProperty({
    description: 'Display name for the business (customer-facing)',
    example: 'Munchies',
  })
  @IsString()
  @IsNotEmpty()
  displayName: string;

  @ApiProperty({
    description: 'Business logo in Base64 format',
    required: false,
    type: Base64FileDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => Base64FileDto)
  logo?: Base64FileDto;

  @ApiProperty({
    description: 'Business contact email',
    example: 'contact@munchies.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Business contact phone number (Nigeria format)',
    example: '+2348012345678',
  })
  @IsPhoneNumber('NG')
  phone: string;

  @ApiProperty({
    description: 'Date when business was established (ISO 8601)',
    example: '2020-01-15',
  })
  @IsDateString()
  establishedAt: string;

  @ApiProperty({
    description: 'Business description',
    example: 'Premium restaurant serving local and continental dishes',
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    enum: BusinessType,
    enumName: 'BusinessType',
    description: 'Type of business',
    example: BusinessType.BAKERY,
  })
  @IsEnum(BusinessType, {
    message: `businessType must be one of: ${Object.values(BusinessType).join(', ')}`,
  })
  businessType: BusinessType;

  @ApiProperty({
    enum: BrandType,
    enumName: 'BrandType',
    description: 'Brand type (franchise, independent, etc.)',
    example: BrandType.INDEPENDENT,
    required: false,
  })
  @IsEnum(BrandType)
  @IsOptional()
  brandType: BrandType;

  @ApiProperty({
    description: 'Business registration number',
    example: 'RC1234567',
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  registrationNumber: string;

  @ApiProperty({
    description: 'Tax identification number',
    example: 'TIN-123456789',
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  taxId: string;

  @ApiProperty({
    enum: ServiceOperation,
    isArray: true,
    enumName: 'ServiceOperation',
    description: 'List of service operations offered',
    example: [ServiceOperation.DELIVERY, ServiceOperation.CATERING],
  })
  @IsArray()
  @IsEnum(ServiceOperation, {
    each: true,
    message: ({ value }) =>
      `Invalid service operation "${value}". Allowed values: ${Object.values(ServiceOperation).join(', ')}`,
  })
  serviceOperations: ServiceOperation[];

  @ApiProperty({
    description: 'Business address details',
    type: AddressDto,
  })
  @ValidateNested()
  @Type(() => AddressDto)
  address: AddressDto;

  @ApiProperty({
    description: 'Business working hours for each day',
    type: [WorkingHourDto],
    example: [
      { day: 'MON', openTime: '09:00', closeTime: '21:00' },
      { day: 'TUE', openTime: '09:00', closeTime: '21:00' },
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WorkingHourDto)
  workingHours: WorkingHourDto[];
}
