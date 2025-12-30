import { IsString, IsNotEmpty } from 'class-validator';

export class WorkingHourDto {
  @IsString()
  @IsNotEmpty()
  day: string;

  @IsString()
  @IsNotEmpty()
  openTime: string;

  @IsString()
  @IsNotEmpty()
  closeTime: string;
}
