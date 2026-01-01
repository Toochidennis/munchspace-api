import { IsEmailOrPhone } from '@/shared/validators/is-email-or-phone.validator';
import { IsNotEmpty, IsString, Validate } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SendOtpDto {
  @ApiProperty({
    description: 'User email address or phone number',
    example: 'john.doe@example.com',
    oneOf: [
      { example: 'john.doe@example.com', description: 'Email address' },
      { example: '+2348012345678', description: 'Phone number' },
    ],
  })
  @IsString()
  @IsNotEmpty()
  @Validate(IsEmailOrPhone)
  identifier: string;
}
