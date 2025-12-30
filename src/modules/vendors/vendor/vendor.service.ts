import { AuthenticatedUser } from '@/modules/auth/types/authenticated-user.type';
import { PrismaService } from '@/shared/infra/prisma/prisma.service';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateBusinessDto } from '@/modules/vendors/vendor/dto/create-business.dto';
import { OnBoardingStage, VendorRole, AvailabilityType } from '@prisma/client';
import slugify from 'slugify';

@Injectable()
export class VendorService {
  constructor(private readonly prisma: PrismaService) {}

  async createBusinessForVendor(
    user: AuthenticatedUser,
    dto: CreateBusinessDto,
  ) {
    const vendorUser = await this.prisma.client.vendorUser.findFirst({
      where: {
        userId: user.userId,
        role: VendorRole.OWNER,
      },
      include: {
        vendor: true,
      },
    });

    if (!vendorUser?.vendor) {
      throw new NotFoundException('Vendor not found');
    }

    const vendor = vendorUser.vendor;

    const existingBusiness = await this.prisma.client.business.findFirst({
      where: { vendorId: vendor.id },
    });

    if (existingBusiness) {
      throw new BadRequestException('Vendor already has a business created');
    }

    const slug: string = slugify(dto.legalName, { lower: true, strict: true });

    return this.prisma.client.$transaction(async (tx) => {
      const business = await tx.business.create({
        data: {
          vendorId: vendor.id,
          legalName: dto.legalName,
          displayName: dto.displayName,
          slug,
          email: dto.email,
          phone: dto.phone,
          establishedAt: new Date(dto.establishedAt),
          description: dto.description,
          businessType: dto.businessType,
          serviceOperations: dto.serviceOperations,
        },
      });

      // Business offering creation
      await tx.businessOffering.create({
        data: {
          businessId: business.id,
          type: business.businessType,
        },
      });

      // Business Profile creation
      await tx.businessProfile.create({
        data: {
          businessId: business.id,
          logoUrl: dto.logoUrl || null,
          primaryPhone: dto.phone,
          supportEmail: dto.email,
          address: dto.address.streetName,
          city: dto.address.city,
          state: dto.address.state,
          country: dto.address.country,
          lga: dto.address.lga || null,
          streetName: dto.address.streetName,
        },
      });

      // Business location (first branch)
      const location = await tx.businessLocation.create({
        data: {
          businessId: business.id,
          name: dto.displayName,
          addressLine1: dto.address.streetName,
          city: dto.address.city,
          state: dto.address.state,
          country: dto.address.country,
          latitude: dto.address.latitude,
          longitude: dto.address.longitude,
        },
      });

      // Working hours / availability
      for (const wh of dto.workingHours) {
        await tx.businessAvailability.create({
          data: {
            businessId: business.id,
            locationId: location.id,
            dayOfWeek: this.mapDayToNumber(wh.day),
            availabilityType: AvailabilityType.OPEN,
            openingTime: new Date(`1970-01-01T${wh.openTime}:00Z`),
            closingTime: new Date(`1970-01-01T${wh.closeTime}:00Z`),
          },
        });
      }

      // Update vendor onboarding state
      await tx.vendor.update({
        where: { id: vendor.id },
        data: { onBoardingStage: OnBoardingStage.DOCUMENTS },
      });

      return business;
    });
  }

  private mapDayToNumber(day: string): number {
    const map: Record<string, number> = {
      MON: 1,
      TUE: 2,
      WED: 3,
      THU: 4,
      FRI: 5,
      SAT: 6,
      SUN: 7,
    };

    return map[day.toUpperCase()] ?? 0;
  }
}
