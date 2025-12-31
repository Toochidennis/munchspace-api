import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiSecurity } from '@nestjs/swagger';

export const ApiAuthBearer = () =>
  applyDecorators(ApiBearerAuth('bearer-auth'));

export const ApiAuthApiKey = () => applyDecorators(ApiSecurity('api-key'));

export const ApiAuthBoth = () =>
  applyDecorators(ApiBearerAuth('bearer-auth'), ApiSecurity('api-key'));
