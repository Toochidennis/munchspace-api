import { IsPhoneNumber, IsString } from 'class-validator';

export class VerifyOtpDto {
  @IsPhoneNumber('NG')
  phone: string;
  @IsString()
  otp: string;
}
