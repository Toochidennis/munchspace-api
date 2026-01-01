import { IsEmailOrPhone } from '@/shared/validators/is-email-or-phone.validator';
import { IsNotEmpty, Validate, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyOtpDto {
  @ApiProperty({
    description: 'User email address or phone number used to request OTP',
    example: 'john.doe@example.com',
  })
  @Validate(IsEmailOrPhone)
  @IsNotEmpty()
  identifier: string;

  @ApiProperty({
    description: '6-digit OTP code sent to the user',
    example: '123456',
    minLength: 6,
    maxLength: 6,
  })
  @IsString()
  @IsNotEmpty()
  otp: string;
}
