import { ReviewStatus } from '@prisma/client';

export class GoLiveResponse {
  businessId: string;
  status: ReviewStatus;
  isActive: boolean;
}
