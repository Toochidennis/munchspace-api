import { VendorOnboardingStep } from '@/modules/vendors/onboarding/enums/vendor-onboarding-step.enum';

export class OnboardingStepDto {
  key: VendorOnboardingStep;
  title: string;
  completed: boolean;
  required: boolean;
}
