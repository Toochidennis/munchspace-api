import { Module } from '@nestjs/common';
import { VendorOnboardingController } from './vendor-onboarding.controller';
import { VendorOnboardingService } from './vendor-onboarding.service';

@Module({
  controllers: [VendorOnboardingController],
  providers: [VendorOnboardingService],
})
export class VendorOnboardingModule {}
