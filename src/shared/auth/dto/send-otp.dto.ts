import { IsPhoneNumber } from 'class-validator';

export class SendOtpDto {
  @IsPhoneNumber('NG')
  phone: string;
}
