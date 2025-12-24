import { Module } from '@nestjs/common';
import { AppController } from '@/app.controller';
import { AppService } from '@/app.service';
import { PrismaModule } from '@/shared/infra/prisma/prisma.module';
import { AuthModule } from '@/modules/auth/auth.module';
import { CustomerModule } from '@/modules/customer/customer.module';
import { RestaurantModule } from '@/restaurant/restaurant.module';
import { ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard } from '@nestjs/throttler';
import { APP_PIPE } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { AllExceptionsFilter } from '@/shared/filters/all-exceptions-filter.filter';
import { ApiKeyGuard } from '@/shared/guards/api-key.guard';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ResponseInterceptor } from '@/shared/interceptor/response-interceptor.interceptor';
import { ConfigModule } from '@nestjs/config';
import { ProfileModule } from '@/modules/profile/profile.module';

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
    ConfigModule.forRoot({
      isGlobal: true,
      validate: (env) => {
        if (!env.JWT_SECRET) {
          throw new Error('JWT_SECRET is missing');
        }
        if (!env.JWT_REFRESH_SECRET) {
          throw new Error('JWT_REFRESH_SECRET is missing');
        }
        return env;
      },
    }),
    ProfileModule,
  ],
  controllers: [AppController],
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
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
  ],
})
export class AppModule {}
