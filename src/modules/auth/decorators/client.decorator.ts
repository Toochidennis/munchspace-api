import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { ClientType } from '@/modules/auth/types/client-type.type';

export const Client = createParamDecorator(
  (_: unknown, ctx: ExecutionContext): ClientType => {
    const req = ctx.switchToHttp().getRequest<{ clientType: ClientType }>();
    return req.clientType;
  },
);
