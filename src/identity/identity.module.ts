import { Module } from '@nestjs/common';
import { IdentityService } from './identity.service';
import { IdentityController } from './identity.controller';

@Module({
  providers: [IdentityService],
  controllers: [IdentityController]
})
export class IdentityModule {}
