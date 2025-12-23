import { IsEmailOrPhone } from '@/shared/validators/is-email-or-phone.validator';
import { IsNotEmpty, Validate, IsString } from 'class-validator';

export class VerifyOtpDto {
  @Validate(IsEmailOrPhone)
  @IsNotEmpty()
  identifier: string;

  @IsString()
  @IsNotEmpty()
  otp: string;
}
