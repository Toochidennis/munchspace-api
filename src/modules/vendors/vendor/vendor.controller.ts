import {
  Controller,
  UseGuards,
  Post,
  Body,
  Get,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { UseApiKey } from '@/shared/decorators/use-api-key.decorator';
import { AccessJwtGuard } from '@/shared/guards/access-jwt.guard';
import { User } from '@/modules/auth/decorators/user.decorator';
import type { AuthenticatedUser } from '@/modules/auth/types/authenticated-user.type';
import { VendorService } from '@/modules/vendors/vendor/vendor.service';
import { CreateBusinessDto } from '@/modules/vendors/vendor/dto/create-business.dto';
import { ApiBody, ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ApiAuthBoth } from '@/shared/decorators/swagger-auth.decorators';

@ApiTags('Vendors')
@ApiAuthBoth()
@UseApiKey()
@UseGuards(AccessJwtGuard)
@Controller({ path: 'vendors/me', version: '1' })
export class VendorController {
  constructor(private readonly vendorService: VendorService) {}

  @ApiOperation({
    summary: 'Create business for vendor',
    description:
      'Register a new business for the authenticated vendor. Requires both x-api-key and bearer token.',
  })
  @ApiResponse({
    status: 201,
    description: 'Business created successfully',
    schema: {
      example: {
        id: 'business_cuid_123',
        legalName: 'Munchies Restaurant Ltd',
        displayName: 'Munchies',
        slug: 'munchies-restaurant-ltd',
        email: 'contact@munchies.com',
        phone: '+2348012345678',
        businessType: 'RESTAURANT',
        status: 'ONBOARDING',
        createdAt: '2024-01-01T00:00:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data or vendor already has a business',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing credentials',
  })
  @ApiResponse({ status: 404, description: 'Vendor not found' })
  @ApiBody({ type: CreateBusinessDto })
  @Post('businesses')
  async createBusiness(
    @User() user: AuthenticatedUser,
    @Body() dto: CreateBusinessDto,
  ) {
    return this.vendorService.createBusinessForVendor(user, dto);
  }

  @ApiOperation({
    summary: 'Get vendor businesses',
    description: 'Retrieve all businesses owned by the authenticated vendor.',
  })
  @ApiResponse({
    status: 200,
    description: 'Businesses retrieved successfully',
    schema: {
      example: [
        {
          id: 'business_cuid_123',
          legalName: 'Munchies Restaurant Ltd',
          displayName: 'Munchies',
          slug: 'munchies-restaurant-ltd',
          status: 'ACTIVE',
          isActive: true,
        },
      ],
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @HttpCode(HttpStatus.OK)
  @Get('businesses')
  async getBusinesses(@User() user: AuthenticatedUser) {
    return this.vendorService.getMyBusinesses(user.userId);
  }

  @ApiOperation({
    summary: 'Get vendor onboarding status',
    description:
      'Retrieve the current onboarding status and progress for the authenticated vendor.',
  })
  @ApiResponse({
    status: 200,
    description: 'Onboarding status retrieved successfully',
    schema: {
      example: {
        vendorId: 'vendor_cuid_123',
        status: 'ACTIVE',
        onBoardingStage: 'BASIC',
        completedSteps: ['BASIC_INFO', 'BUSINESS_DETAILS'],
        nextStep: 'VERIFICATION',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @HttpCode(HttpStatus.OK)
  @Get('onboarding')
  async getOnboardingStatus(@User() user: AuthenticatedUser) {
    return this.vendorService.getMyOnboarding(user.userId);
  }
}
