// vendors/onboarding/vendor-onboarding.controller.ts
import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import { VendorOnboardingService } from './vendor-onboarding.service';
import { User } from '@/modules/auth/decorators/user.decorator';
import { AccessJwtGuard } from '@/shared/guards/access-jwt.guard';
import { ApiTags } from '@nestjs/swagger';
import type { AuthenticatedUser } from '@/modules/auth/types/authenticated-user.type';

@ApiTags('Vendors', 'Onboarding')
@UseGuards(AccessJwtGuard)
@Controller({ path: 'vendors/me', version: '1' })
export class VendorOnboardingController {
  constructor(private readonly onboardingService: VendorOnboardingService) {}

  @Get('onboarding')
  getOnboarding(@User() user: AuthenticatedUser) {
    return this.onboardingService.getOnboarding(user.userId);
  }

  @Post('go-live')
  goLive(@User() user: AuthenticatedUser) {
    return this.onboardingService.goLive(user.userId);
  }
}
