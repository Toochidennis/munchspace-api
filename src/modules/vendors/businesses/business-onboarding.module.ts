import { Module } from '@nestjs/common';
import { BusinessOnboardingController } from '@/modules/vendors/businesses/business-onboarding.controller';
import { BusinessOnboardingService } from '@/modules/vendors/businesses/business-onboarding.service';
import { BusinessGoLiveService } from '@/modules/vendors/businesses/business-go-live.service';
import { AuthModule } from '@/modules/auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [BusinessOnboardingController],
  providers: [BusinessOnboardingService, BusinessGoLiveService],
  exports: [],
})
export class BusinessOnboardingModule {}
