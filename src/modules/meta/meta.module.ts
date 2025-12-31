import { Module } from '@nestjs/common';
import { MetaService } from '@/modules/meta/meta.service';
import { MetaController } from '@/modules/meta/meta.controller';
import { AuthModule } from '@/modules/auth/auth.module';

@Module({
  imports: [AuthModule],
  providers: [MetaService],
  controllers: [MetaController],
})
export class MetaModule {}
