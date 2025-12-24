import { AuthenticatedUser } from '@/modules/auth/types/authenticated-user.type';
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '@/shared/infra/prisma/prisma.service';

@Injectable()
export class AccountStatusGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context
      .switchToHttp()
      .getRequest<{ user: AuthenticatedUser }>();
    const { user } = request;

    const dbUser = await this.prisma.client.user.findUnique({
      where: { id: user.userId },
      select: {
        isActive: true,
        isBlocked: true,
      },
    });

    if (!dbUser || !dbUser.isActive || dbUser.isBlocked) {
      throw new UnauthorizedException('Account is disabled');
    }

    return true;
  }
}
