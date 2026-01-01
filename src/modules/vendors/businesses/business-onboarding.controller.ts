import { Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { BusinessOnboardingService } from '@/modules/vendors/businesses/business-onboarding.service';
import { BusinessGoLiveService } from '@/modules/vendors/businesses/business-go-live.service';
import { User } from '@/modules/auth/decorators/user.decorator';
import type { AuthenticatedUser } from '@/modules/auth/types/authenticated-user.type';
import { UseApiKey } from '@/shared/decorators/use-api-key.decorator';
import { AccessJwtGuard } from '@/shared/guards/access-jwt.guard';
import { ApiAuthApiKey } from '@/shared/decorators/swagger-auth.decorators';

@ApiAuthApiKey()
@UseApiKey()
@UseGuards(AccessJwtGuard)
@Controller({ path: 'vendors/me/businesses', version: '1' })
export class BusinessOnboardingController {
  constructor(
    private readonly onboardingService: BusinessOnboardingService,
    private readonly goLiveService: BusinessGoLiveService,
  ) {}

  @Get(':businessId/onboarding')
  async onboarding(
    @Param('businessId') businessId: string,
    @User() user: AuthenticatedUser,
  ) {
    return this.onboardingService.getBusinessOnboarding(
      businessId,
      user.userId,
    );
  }

  @Post(':businessId/go-live')
  async goLive(
    @Param('businessId') businessId: string,
    @User() user: AuthenticatedUser,
  ) {
    return this.goLiveService.goLive(businessId, user.userId);
  }
}
