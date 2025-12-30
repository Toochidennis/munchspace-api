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

export class CreateBusinessDto {
  @IsString()
  @IsNotEmpty()
  legalName: string;

  @IsString()
  @IsNotEmpty()
  displayName: string;

  @IsOptional()
  @IsString()
  logoUrl?: string;

  @IsEmail()
  email: string;

  @IsPhoneNumber(undefined)
  phone: string;

  @IsDateString()
  establishedAt: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsEnum(BusinessType)
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

  @IsArray()
  @IsString({ each: true })
  serviceOperations: ServiceOperation[];

  @ValidateNested()
  @Type(() => AddressDto)
  address: AddressDto;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WorkingHourDto)
  workingHours: WorkingHourDto[];
}
