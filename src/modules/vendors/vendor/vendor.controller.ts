import { Controller, UseGuards, Post, Body } from '@nestjs/common';
import { UseApiKey } from '@/shared/decorators/use-api-key.decorator';
import { AccessJwtGuard } from '@/shared/guards/access-jwt.guard';
import { User } from '@/modules/auth/decorators/user.decorator';
import type { AuthenticatedUser } from '@/modules/auth/types/authenticated-user.type';
import { VendorService } from '@/modules/vendors/vendor/vendor.service';
import { CreateBusinessDto } from '@/modules/vendors/vendor/dto/create-business.dto';
import { ApiBody } from '@nestjs/swagger';

@UseApiKey()
@UseGuards(AccessJwtGuard)
@Controller('vendors/me')
export class VendorController {
  constructor(private readonly vendorService: VendorService) {}

  @ApiBody({ type: CreateBusinessDto })
  @Post('businesses')
  createBusiness(
    @User() user: AuthenticatedUser,
    @Body() dto: CreateBusinessDto,
  ) {
    return this.vendorService.createBusinessForVendor(user, dto);
  }
}
