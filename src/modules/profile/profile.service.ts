import { PrismaService } from '@/shared/infra/prisma/prisma.service';
import { ForbiddenException, Injectable } from '@nestjs/common';
import { Role } from '@prisma/client';

@Injectable()
export class ProfileService {
  constructor(private readonly prisma: PrismaService) {}

  async resolveProfile(userId: string, role: Role) {
    switch (role) {
      case Role.CUSTOMER:
        return await this.prisma.client.customer.findUnique({
          where: { userId },
        });
      case Role.ADMIN:
        return await this.prisma.client.admin.findUnique({
          where: { id: userId },
        });
      default:
        throw new ForbiddenException('Invalid role');
    }
  }
}
