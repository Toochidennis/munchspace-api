import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';
import { ApiKeyGuard } from '@/shared/guards/api-key.guard';

export const UseApiKey = () =>
  applyDecorators(SetMetadata('auth', 'api-key'), UseGuards(ApiKeyGuard));
