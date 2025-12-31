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
  @IsString()
  @IsNotEmpty()
  legalName: string;

  @IsString()
  @IsNotEmpty()
  displayName: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => Base64FileDto)
  logo?: Base64FileDto;

  @IsEmail()
  email: string;

  @IsPhoneNumber('NG')
  phone: string;

  @IsDateString()
  establishedAt: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    enum: BusinessType,
    enumName: 'BusinessType',
    example: BusinessType.BAKERY,
  })
  @IsEnum(BusinessType, {
    message: `businessType must be one of: ${Object.values(BusinessType).join(', ')}`,
  })
  businessType: BusinessType;

  @IsEnum(BrandType)
  @IsOptional()
  brandType: BrandType;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  registrationNumber: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  taxId: string;

  @ApiProperty({
    enum: ServiceOperation,
    description: `
        DELIVERY: Orders are delivered to customers
        PICKUP: Customers pick up orders themselves
        DINE_IN: On-premise consumption
        `,
  })
  @IsEnum(ServiceOperation, {
    each: true,
    message: `serviceOperations contains an invalid value`,
  })
  serviceOperations: ServiceOperation[];

  @ValidateNested()
  @Type(() => AddressDto)
  address: AddressDto;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WorkingHourDto)
  workingHours: WorkingHourDto[];
}
