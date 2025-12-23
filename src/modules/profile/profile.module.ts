import { Module } from '@nestjs/common';
import { ProfileService } from '@/modules/profile/profile.service';
import { ProfileController } from '@/modules/profile/profile.controller';

@Module({
  providers: [ProfileService],
  controllers: [ProfileController],
})
export class ProfileModule {}
