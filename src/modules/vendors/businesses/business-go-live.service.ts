import {
  Injectable,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { BusinessOnboardingService } from '@/modules/vendors/businesses/business-onboarding.service';
import { GoLiveResponse } from '@/modules/vendors/businesses/dto/go-live.dto';
import { PrismaService } from '@/shared/infra/prisma/prisma.service';

@Injectable()
export class BusinessGoLiveService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly onboardingService: BusinessOnboardingService,
  ) {}

  async goLive(businessId: string, userId: string): Promise<GoLiveResponse> {
    // Vendor readiness
    const vendor = await this.prisma.client.vendor.findUnique({
      where: { userId },
      include: { documents: true, financials: true },
    });

    if (!vendor) throw new ForbiddenException();

    const vendorReady =
      vendor.documents.every((d) => d.status === 'APPROVED') &&
      !!vendor.financials;

    if (!vendorReady) {
      throw new BadRequestException('Vendor onboarding incomplete');
    }

    // Business readiness
    const onboarding = await this.onboardingService.getBusinessOnboarding(
      businessId,
      userId,
    );

    if (!onboarding.canGoLive) {
      throw new BadRequestException({
        message: 'Business onboarding incomplete',
        pending: onboarding.pending,
      });
    }

    const business = await this.prisma.client.business.update({
      where: { id: businessId },
      data: {
        isActive: true,
        status: 'ACTIVE',
        onBoardingStage: 'LIVE',
      },
    });

    return {
      businessId: business.id,
      status: business.status,
      isActive: business.isActive,
    };
  }
}
