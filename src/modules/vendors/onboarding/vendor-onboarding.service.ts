import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '@/shared/infra/prisma/prisma.service';
import { VendorOnboardingStep } from './enums/vendor-onboarding-step.enum';
import { VendorOnboardingDto } from './dto/vendor-onboarding.dto';
import { Business, ReviewStatus, OnBoardingStage } from '@prisma/client';

@Injectable()
export class VendorOnboardingService {
  constructor(private readonly prisma: PrismaService) {}

  async getOnboarding(userId: string): Promise<VendorOnboardingDto> {
    const vendor = await this.prisma.client.vendor.findUnique({
      where: { userId },
      include: {
        documents: true,
        financials: true,
        businesses: {
          include: { documents: true },
        },
      },
    });

    if (!vendor) {
      return this.buildResponse([]);
    }

    const steps = [];

    const vendorKycVerified = vendor.documents.some(
      (d) => d.status === ReviewStatus.APPROVED,
    );

    steps.push(
      this.step(
        VendorOnboardingStep.VENDOR_KYC_VERIFIED,
        'Verify your identity',
        vendorKycVerified,
      ),
    );

    // 2. Settlement account
    const settlementDone = !!vendor.financials;

    steps.push(
      this.step(
        VendorOnboardingStep.SETTLEMENT_ACCOUNT,
        'Set up settlement account',
        settlementDone,
      ),
    );

    // 3. Business created
    const business = vendor.businesses[0] ?? null;
    const businessCreated = !!business;

    steps.push(
      this.step(
        VendorOnboardingStep.BUSINESS_CREATED,
        'Create your first business',
        businessCreated,
      ),
    );

    if (!business) {
      return this.buildResponse(steps);
    }

    // 4. Business KYC verified
    const businessKycVerified = business.documents.some(
      (d) => d.status === ReviewStatus.APPROVED,
    );

    steps.push(
      this.step(
        VendorOnboardingStep.BUSINESS_KYC_VERIFIED,
        'Upload business documents',
        businessKycVerified,
      ),
    );

    /* 5. Menu */
    const [menuCategoryCount, menuItemCount] = await Promise.all([
      this.prisma.client.menuCategory.count({
        where: { businessId: business.id },
      }),
      this.prisma.client.menuItem.count({
        where: { businessId: business.id },
      }),
    ]);

    steps.push(
      this.step(
        VendorOnboardingStep.MENU_CREATED,
        'Add your menu',
        menuCategoryCount > 0 && menuItemCount > 0,
      ),
    );

    /* 6. Availability + charges */
    const [availabilityCount, charges] = await Promise.all([
      this.prisma.client.businessAvailability.count({
        where: { businessId: business.id },
      }),
      this.prisma.client.businessCharge.findFirst({
        where: { businessId: business.id },
      }),
    ]);

    steps.push(
      this.step(
        VendorOnboardingStep.AVAILABILITY_SET,
        'Set availability & charges',
        availabilityCount > 0 && !!charges,
      ),
    );

    /* 7. Ready to go live (derived) */
    const ready = steps.filter((s) => s.required).every((s) => s.completed);

    steps.push(
      this.step(VendorOnboardingStep.READY_TO_GO_LIVE, 'Go live', ready, false),
    );

    return this.buildResponse(steps);
  }

  /* -------------------------------------------
   * BUSINESS STATUS (PER BUSINESS, INTERNAL)
   * ------------------------------------------- */
  private async getBusinessStatus(business: Business) {
    const [
      docApproved,
      menuCatCount,
      menuItemCount,
      availabilityCount,
      charges,
    ] = await Promise.all([
      this.prisma.client.businessDocument.count({
        where: {
          businessId: business.id,
          status: ReviewStatus.APPROVED,
        },
      }),
      this.prisma.client.menuCategory.count({
        where: { businessId: business.id },
      }),
      this.prisma.client.menuItem.count({
        where: { businessId: business.id },
      }),
      this.prisma.client.businessAvailability.count({
        where: { businessId: business.id },
      }),
      this.prisma.client.businessCharge.findFirst({
        where: { businessId: business.id },
      }),
    ]);

    const kycVerified = docApproved > 0;
    const menuReady = menuCatCount > 0 && menuItemCount > 0;
    const availabilityReady = availabilityCount > 0 && !!charges;

    const pending: VendorOnboardingStep[] = [];
    if (!kycVerified) pending.push(VendorOnboardingStep.BUSINESS_KYC_VERIFIED);
    if (!menuReady) pending.push(VendorOnboardingStep.MENU_CREATED);
    if (!availabilityReady) pending.push(VendorOnboardingStep.AVAILABILITY_SET);

    return {
      kycVerified,
      menuReady,
      availabilityReady,
      canGoLive: pending.length === 0,
      pending,
    };
  }

  /* -------------------------------------------
   * GO LIVE (EXPLICIT BUSINESS)
   * ------------------------------------------- */
  async goLive(userId: string, businessId: string) {
    const vendor = await this.prisma.client.vendor.findUnique({
      where: { userId },
      include: {
        documents: true,
        financials: true,
        businesses: {
          include: { documents: true },
        },
      },
    });

    if (!vendor) {
      throw new BadRequestException('Vendor not found');
    }

    /* Vendor-level checks */
    const vendorKycOk = vendor.documents.some(
      (d) => d.status === ReviewStatus.APPROVED,
    );

    if (!vendorKycOk) {
      throw new BadRequestException('Vendor KYC not completed');
    }

    if (!vendor.financials) {
      throw new BadRequestException('Settlement account not set');
    }

    /* Ownership check */
    const business = vendor.businesses.find((b) => b.id === businessId);

    if (!business) {
      throw new BadRequestException('Business does not belong to this vendor');
    }

    /* Business readiness */
    const status = await this.getBusinessStatus(business);

    if (!status.canGoLive) {
      throw new BadRequestException(
        `Business not ready to go live. Pending: ${status.pending.join(', ')}`,
      );
    }

    /* Activate (transactional) */
    await this.prisma.client.$transaction([
      this.prisma.client.vendor.update({
        where: { id: vendor.id },
        data: {
          status: ReviewStatus.APPROVED,
          onBoardingStage: OnBoardingStage.LIVE,
        },
      }),
      this.prisma.client.business.update({
        where: { id: business.id },
        data: {
          isActive: true,
          status: ReviewStatus.APPROVED,
          onBoardingStage: OnBoardingStage.LIVE,
        },
      }),
    ]);

    return {
      message: 'Business is now live',
      businessId: business.id,
    };
  }

  /* -------------------------------------------
   * HELPERS
   * ------------------------------------------- */
  private step(
    key: VendorOnboardingStep,
    title: string,
    completed: boolean,
    required = true,
  ) {
    return { key, title, completed, required };
  }

  private buildResponse(steps: any[]): VendorOnboardingDto {
    const required = steps.filter((s) => s.required);
    const completed = required.filter((s) => s.completed).length;

    return {
      currentStep:
        required.find((s) => !s.completed)?.key ??
        VendorOnboardingStep.READY_TO_GO_LIVE,
      completed,
      total: required.length,
      isComplete: completed === required.length,
      steps,
    };
  }
}
