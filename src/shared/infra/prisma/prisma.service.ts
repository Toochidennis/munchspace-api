import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '../../../../generated/prisma/client.js';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  user: any;
  async onModuleInit() {
    await this.$connect();
  }
}
