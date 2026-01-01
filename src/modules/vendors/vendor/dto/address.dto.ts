import { IsString, IsNotEmpty, IsOptional, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddressDto {
  @ApiProperty({
    description: 'Street name and number',
    example: '123 Main Street',
  })
  @IsString()
  @IsNotEmpty()
  streetName: string;

  @ApiProperty({
    description: 'City name',
    example: 'Lagos',
  })
  @IsString()
  @IsNotEmpty()
  city: string;

  @ApiProperty({
    description: 'State or province',
    example: 'Lagos',
  })
  @IsString()
  @IsNotEmpty()
  state: string;

  @ApiProperty({
    description: 'Country name',
    example: 'Nigeria',
  })
  @IsString()
  @IsNotEmpty()
  country: string;

  @ApiProperty({
    description: 'Local Government Area (for Nigeria)',
    example: 'Ikeja',
    required: false,
  })
  @IsOptional()
  @IsString()
  lga?: string;

  @ApiProperty({
    description: 'Longitude coordinate',
    example: 3.3792,
  })
  @IsNumber()
  longitude: number;

  @ApiProperty({
    description: 'Latitude coordinate',
    example: 6.5244,
  })
  @IsNumber()
  latitude: number;

  @ApiProperty({
    description: 'Postal code',
    example: 100001,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  postalCode?: number;
}
