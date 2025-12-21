import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { IdentityModule } from './identity/identity.module';
import { PrismaModule } from './shared/infra/prisma/prisma.module';
import { AuthModule } from './shared/auth/auth.module';
import { AuthController } from './auth/auth.controller';
import { CustomerController } from './customer/customer.controller';
import { CustomerModule } from './customer/customer.module';
import { RestaurantModule } from './restaurant/restaurant.module';

@Module({
  imports: [IdentityModule, PrismaModule, AuthModule, CustomerModule, RestaurantModule],
  controllers: [AppController, AuthController, CustomerController],
  providers: [AppService],
})
export class AppModule {}
