import { UseGuards } from '@nestjs/common';
import { ApiKeyGuard } from '@/shared/guards/api-key.guard';

export const UseApiKey = () => UseGuards(ApiKeyGuard);
