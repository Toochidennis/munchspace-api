import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/shared/infra/prisma/prisma.service';
import { BusinessOnboardingDto } from '@/modules/vendors/businesses/dto/business-onboarding.dto';
import { ReviewStatus } from '@prisma/client';

@Injectable()
export class BusinessOnboardingService {
  constructor(private readonly prisma: PrismaService) {}

  async getBusinessOnboarding(
    businessId: string,
    userId: string,
  ): Promise<BusinessOnboardingDto> {
    const business = await this.prisma.client.business.findFirst({
      where: {
        id: businessId,
        vendor: { userId },
      },
      include: {
        documents: true,
        menuCategories: { include: { items: true } },
        availabilities: true,
        businessCharges: true,
      },
    });

    if (!business) throw new NotFoundException('Business not found');

    const pending: string[] = [];

    const kycVerified =
      business.documents.length > 0 &&
      business.documents.every((d) => d.status === ReviewStatus.APPROVED);

    if (!kycVerified) pending.push('Business documents not approved');

    const menuReady = business.menuCategories.some((c) => c.items.length > 0);

    if (!menuReady) pending.push('Menu not configured');

    const availabilityReady = business.availabilities.length > 0;
    if (!availabilityReady) pending.push('Availability not set');

    const chargesReady = business.businessCharges.length > 0;
    if (!chargesReady) pending.push('Charges not configured');

    return {
      businessId,
      kycVerified,
      menuReady,
      availabilityReady,
      chargesReady,
      pending,
      canGoLive: pending.length === 0,
    };
  }
}
