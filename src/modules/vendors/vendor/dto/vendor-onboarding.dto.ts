export class VendorOnboardingDto {
  vendorId: string;
  kycCompleted: boolean;
  bankAccountSet: boolean;
  hasBusiness: boolean;
  pending: string[];
  isReady: boolean;
}
