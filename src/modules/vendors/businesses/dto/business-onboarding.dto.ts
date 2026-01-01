export class BusinessOnboardingDto {
  businessId: string;
  kycVerified: boolean;
  menuReady: boolean;
  availabilityReady: boolean;
  chargesReady: boolean;
  pending: string[];
  canGoLive: boolean;
}
