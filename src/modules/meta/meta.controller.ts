import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiOkResponse } from '@nestjs/swagger';
import { MetaService } from '@/modules/meta/meta.service';
import { UseApiKey } from '@/shared/decorators/use-api-key.decorator';

@ApiTags('Meta')
@UseApiKey()
@Controller('meta')
export class MetaController {
  constructor(private readonly metaService: MetaService) {}

  @ApiOperation({ summary: 'List supported service operations' })
  @ApiOkResponse({ type: [String] })
  @Get('service-operations')
  getServiceOperations() {
    return this.metaService.getServiceOperations();
  }

  @ApiOperation({ summary: 'List supported business types' })
  @ApiOkResponse({ type: [String] })
  @Get('business-types')
  getBusinessTypes() {
    return this.metaService.getBusinessTypes();
  }
}
