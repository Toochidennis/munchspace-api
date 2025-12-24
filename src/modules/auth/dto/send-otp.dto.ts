import { IsEmailOrPhone } from '@/shared/validators/is-email-or-phone.validator';
import { IsNotEmpty, IsString, Validate } from 'class-validator';

export class SendOtpDto {
  @IsString()
  @IsNotEmpty()
  @Validate(IsEmailOrPhone)
  identifier: string;
}
