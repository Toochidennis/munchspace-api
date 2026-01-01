import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import fastifyCompress from '@fastify/compress';
//import type { FastifyRequest, FastifyReply } from 'fastify';

import {
  NestFastifyApplication,
  FastifyAdapter,
} from '@nestjs/platform-fastify';
import fastifyHelmet from '@fastify/helmet';
import { VersioningType } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({ logger: true }),
  );

  app.setGlobalPrefix('api');
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  // app
  //   .getHttpAdapter()
  //   .getInstance()
  //   .setNotFoundHandler((request: FastifyRequest, reply: FastifyReply) => {
  //     void reply.status(404).send({
  //       success: false,
  //       statusCode: 404,
  //       error: 'Not Found',
  //       message: `Cannot ${request.method} ${request.url}`,
  //     });
  //   });

  await app.register(fastifyHelmet, { global: true });
  await app.register(fastifyCompress);

  app.enableCors({
    origin: '*',
    methods: ['GET', 'X-API-KEY', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    credentials: true,
  });

  const config = new DocumentBuilder()
    .setTitle('MunchSpace API')
    .setDescription('API documentation for MunchSpace application')
    .setVersion('v1')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'JWT Access Token',
      },
      'bearer-auth',
    )
    .addApiKey(
      {
        type: 'apiKey',
        name: 'x-api-key',
        in: 'header',
        description: 'API Key for client authentication',
      },
      'api-key',
    )
    .addTag('api')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port, '0.0.0.0');

  console.log(`Application is running on: http://localhost:${port}`);
}
bootstrap().catch((err) => {
  console.error('Error during application bootstrap:', err);
  process.exit(1);
});
