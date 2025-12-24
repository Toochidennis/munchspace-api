import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsArray,
  IsPhoneNumber,
  IsString,
  IsDate,
} from 'class-validator';

export class CreateCustomerDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsPhoneNumber()
  @IsNotEmpty()
  phone: string;

  @IsOptional()
  @IsArray()
  orders?: string[];

  @IsOptional()
  @IsDate()
  updatedAt?: Date;
}
