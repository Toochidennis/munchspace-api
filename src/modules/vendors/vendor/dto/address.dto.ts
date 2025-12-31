import { IsString, IsNotEmpty, IsOptional, IsNumber } from 'class-validator';

export class AddressDto {
  @IsString()
  @IsNotEmpty()
  streetName: string;

  @IsString()
  @IsNotEmpty()
  city: string;

  @IsString()
  @IsNotEmpty()
  state: string;

  @IsString()
  @IsNotEmpty()
  country: string;

  @IsOptional()
  @IsString()
  lga?: string;

  @IsNumber()
  longitude: number;

  @IsNumber()
  latitude: number;

  @IsOptional()
  @IsNumber()
  postalCode?: number;
}
