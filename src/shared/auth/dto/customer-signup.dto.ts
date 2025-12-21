import { IsEmail, IsNotEmpty, IsPhoneNumber } from 'class-validator';

export class CustomerSignupDto {
  @IsNotEmpty()
  name: string;

  @IsEmail()
  email: string;

  @IsPhoneNumber('NG')
  phone: string;

  @IsNotEmpty()
  birthday: string;
}
