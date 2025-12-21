import { Injectable } from '@nestjs/common';
import { PrismaService } from '../shared/infra/prisma/prisma.service';

@Injectable()
export class IdentityService {
  constructor(private prisma: PrismaService) {}

  async findByEmail(email: string) {
    return await this.prisma.user.findUnique({
      where: {
        email,
      },
    });
  }
}
