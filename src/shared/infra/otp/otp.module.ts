import { Module } from '@nestjs/common';
import { OtpService } from './otp.service';
import { OtpStore } from './otp.store';
import { PrismaModule } from '../prisma/prisma.module';
//import { OtpSender } from './otp.sender';

@Module({
  imports: [PrismaModule],
  providers: [OtpService, OtpStore],
  exports: [OtpService],
})
export class OtpModule {}
