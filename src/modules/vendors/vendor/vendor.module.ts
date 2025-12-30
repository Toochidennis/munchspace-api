import { Module } from '@nestjs/common';
import { VendorController } from '@/modules/vendors/vendor/vendor.controller';
import { VendorService } from '@/modules/vendors/vendor/vendor.service';
import { AuthModule } from '@/modules/auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [VendorController],
  providers: [VendorService],
})
export class VendorModule {}
