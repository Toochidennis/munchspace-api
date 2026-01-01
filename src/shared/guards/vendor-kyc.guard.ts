import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../infra/prisma/prisma.service';
import { AuthenticatedUser } from '@/modules/auth/types/authenticated-user.type';

@Injectable()
export class VendorKycGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(ctx: ExecutionContext) {
    const req = ctx.switchToHttp().getRequest<{
      user: AuthenticatedUser;
    }>();
    const { user } = req;

    const vendor = await this.prisma.client.vendor.findUnique({
      where: { userId: user.userId },
      include: { documents: true },
    });

    if (!vendor) throw new ForbiddenException('Vendor not found');

    const kycOk = vendor.documents.some((d) => d.status === 'APPROVED');

    if (!kycOk) {
      throw new ForbiddenException('Complete vendor KYC first');
    }

    return true;
  }
}
