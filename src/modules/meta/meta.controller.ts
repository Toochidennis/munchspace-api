import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { MetaService } from '@/modules/meta/meta.service';
import { UseApiKey } from '@/shared/decorators/use-api-key.decorator';
import { ApiAuthApiKey } from '@/shared/decorators/swagger-auth.decorators';

@ApiTags('Meta')
@ApiAuthApiKey()
@UseApiKey()
@Controller({ path: 'meta', version: '1' })
export class MetaController {
  constructor(private readonly metaService: MetaService) {}

  @ApiOperation({
    summary: 'List supported service operations',
    description:
      'Get all available service operation types for businesses (e.g., DELIVERY, PICKUP, DINE_IN).',
  })
  @ApiResponse({
    status: 200,
    description: 'List of service operations',
    schema: {
      example: ['DELIVERY', 'PICKUP', 'DINE_IN', 'CATERING'],
    },
  })
  @HttpCode(HttpStatus.OK)
  @Get('service-operations')
  getServiceOperations() {
    return this.metaService.getServiceOperations();
  }

  @ApiOperation({
    summary: 'List supported business types',
    description:
      'Get all available business type categories (e.g., RESTAURANT, GROCERY, PHARMACY).',
  })
  @ApiResponse({
    status: 200,
    description: 'List of business types',
    schema: {
      example: ['RESTAURANT', 'GROCERY', 'PHARMACY', 'CONVENIENCE_STORE'],
    },
  })
  @HttpCode(HttpStatus.OK)
  @Get('business-types')
  getBusinessTypes() {
    return this.metaService.getBusinessTypes();
  }
}
