import { Injectable } from '@nestjs/common';
import { ServiceOperation, BusinessType } from '@prisma/client';

@Injectable()
export class MetaService {
  getServiceOperations() {
    return Object.values(ServiceOperation);
  }

  getBusinessTypes() {
    return Object.values(BusinessType);
  }
}
