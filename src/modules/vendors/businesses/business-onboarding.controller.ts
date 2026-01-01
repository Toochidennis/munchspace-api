import {
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { BusinessOnboardingService } from '@/modules/vendors/businesses/business-onboarding.service';
import { BusinessGoLiveService } from '@/modules/vendors/businesses/business-go-live.service';
import { User } from '@/modules/auth/decorators/user.decorator';
import type { AuthenticatedUser } from '@/modules/auth/types/authenticated-user.type';
import { UseApiKey } from '@/shared/decorators/use-api-key.decorator';
import { AccessJwtGuard } from '@/shared/guards/access-jwt.guard';
import { ApiAuthBoth } from '@/shared/decorators/swagger-auth.decorators';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';

@ApiTags('Business Onboarding')
@ApiAuthBoth()
@UseApiKey()
@UseGuards(AccessJwtGuard)
@Controller({ path: 'vendors/me/businesses', version: '1' })
export class BusinessOnboardingController {
  constructor(
    private readonly onboardingService: BusinessOnboardingService,
    private readonly goLiveService: BusinessGoLiveService,
  ) {}

  @ApiOperation({
    summary: 'Get business onboarding status',
    description:
      'Retrieve the onboarding progress and requirements for a specific business. Requires both x-api-key and bearer token.',
  })
  @ApiParam({
    name: 'businessId',
    description: 'Unique identifier of the business',
    example: 'business_cuid_123',
  })
  @ApiResponse({
    status: 200,
    description: 'Onboarding status retrieved successfully',
    schema: {
      example: {
        businessId: 'business_cuid_123',
        onBoardingStage: 'BASIC',
        status: 'ONBOARDING',
        completedSteps: [
          {
            step: 'BUSINESS_INFO',
            completed: true,
            completedAt: '2024-01-01T00:00:00.000Z',
          },
          {
            step: 'LOCATION',
            completed: true,
            completedAt: '2024-01-02T00:00:00.000Z',
          },
        ],
        remainingSteps: [
          {
            step: 'MENU',
            required: true,
          },
          {
            step: 'VERIFICATION',
            required: true,
          },
        ],
        readyToGoLive: false,
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Business not found' })
  @HttpCode(HttpStatus.OK)
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

  @ApiOperation({
    summary: 'Make business go live',
    description:
      'Submit business for approval and make it live. All onboarding requirements must be completed before calling this endpoint.',
  })
  @ApiParam({
    name: 'businessId',
    description: 'Unique identifier of the business',
    example: 'business_cuid_123',
  })
  @ApiResponse({
    status: 200,
    description: 'Business submitted for approval',
    schema: {
      example: {
        businessId: 'business_cuid_123',
        status: 'PENDING_APPROVAL',
        message:
          'Business submitted for review. You will be notified once approved.',
        submittedAt: '2024-01-05T00:00:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Business onboarding incomplete or already live',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Business not found' })
  @HttpCode(HttpStatus.OK)
  @Post(':businessId/go-live')
  async goLive(
    @Param('businessId') businessId: string,
    @User() user: AuthenticatedUser,
  ) {
    return this.goLiveService.goLive(businessId, user.userId);
  }
}
