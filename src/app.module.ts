import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './shared/infra/prisma/prisma.module';
import { AuthModule } from './shared/auth/auth.module';
import { CustomerController } from './customer/customer.controller';
import { CustomerModule } from './customer/customer.module';
import { RestaurantModule } from './restaurant/restaurant.module';
import { AuthController } from './shared/auth/auth.controller';
import { ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard } from '@nestjs/throttler';
import { APP_PIPE } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { AllExceptionsFilter } from './shared/filters/all-exceptions-filter.filter';
import { ApiKeyGuard } from './shared/auth/guards/api-key.guard';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    CustomerModule,
    RestaurantModule,
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 10,
      },
    ]),
  ],
  controllers: [AppController, AuthController, CustomerController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ApiKeyGuard,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    },
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
  ],
})
export class AppModule {}
