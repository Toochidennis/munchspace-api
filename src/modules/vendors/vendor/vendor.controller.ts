import { Controller, UseGuards, Post, Body } from '@nestjs/common';
import { UseApiKey } from '@/shared/decorators/use-api-key.decorator';
import { AccessJwtGuard } from '@/shared/guards/access-jwt.guard';
import { User } from '@/modules/auth/decorators/user.decorator';
import type { AuthenticatedUser } from '@/modules/auth/types/authenticated-user.type';
import { VendorService } from '@/modules/vendors/vendor/vendor.service';

@UseApiKey()
@UseGuards(AccessJwtGuard)
@Controller('vendors/me')
export class VendorController {
    constructor(private readonly vendorService: VendorService) {}

  @Post('businesses')
  createBusiness(@User user: AuthenticatedUser, @Body() businessData: any) {
    return this.vendorService.createBusinessForVendor(user, businessData);
  }
}
