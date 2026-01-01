import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class WorkingHourDto {
  @ApiProperty({
    description: 'Day of the week',
    example: 'MON',
    enum: ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'],
  })
  @IsString()
  @IsNotEmpty()
  day: string;

  @ApiProperty({
    description: 'Opening time in HH:MM format (24-hour)',
    example: '09:00',
  })
  @IsString()
  @IsNotEmpty()
  openTime: string;

  @ApiProperty({
    description: 'Closing time in HH:MM format (24-hour)',
    example: '21:00',
  })
  @IsString()
  @IsNotEmpty()
  closeTime: string;
}
