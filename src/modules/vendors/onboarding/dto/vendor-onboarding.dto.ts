import { VendorOnboardingStep } from '@/modules/vendors/onboarding/enums/vendor-onboarding-step.enum';
import { OnboardingStepDto } from './onboarding-step.dto';

export class VendorOnboardingDto {
  currentStep: VendorOnboardingStep;
  completed: number;
  total: number;
  isComplete: boolean;
  steps: OnboardingStepDto[];
}
