import { Controller, UseGuards, Post, Body, Get } from '@nestjs/common';
import { UseApiKey } from '@/shared/decorators/use-api-key.decorator';
import { AccessJwtGuard } from '@/shared/guards/access-jwt.guard';
import { User } from '@/modules/auth/decorators/user.decorator';
import type { AuthenticatedUser } from '@/modules/auth/types/authenticated-user.type';
import { VendorService } from '@/modules/vendors/vendor/vendor.service';
import { CreateBusinessDto } from '@/modules/vendors/vendor/dto/create-business.dto';
import { ApiBody } from '@nestjs/swagger';

@UseApiKey()
@UseGuards(AccessJwtGuard)
@Controller({ path: 'vendors/me', version: '1' })
export class VendorController {
  constructor(private readonly vendorService: VendorService) {}

  @ApiBody({ type: CreateBusinessDto })
  @Post('businesses')
  async createBusiness(
    @User() user: AuthenticatedUser,
    @Body() dto: CreateBusinessDto,
  ) {
    return this.vendorService.createBusinessForVendor(user, dto);
  }

  @Get('businesses')
  async getBusinesses(@User() user: AuthenticatedUser) {
    return this.vendorService.getMyBusinesses(user.userId);
  }

  @Get('onboarding')
  async getOnboardingStatus(@User() user: AuthenticatedUser) {
    return this.vendorService.getMyOnboarding(user.userId);
  }
}
