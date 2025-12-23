import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Role } from '@prisma/client';

export const User = createParamDecorator(
  (_: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<{
      user: { userId: string; role: Role };
    }>();
    const { user } = request;
    return user;
  },
);
