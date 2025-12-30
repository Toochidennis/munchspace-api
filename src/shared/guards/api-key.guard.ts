import type { ApiKeyResolver } from '@/modules/auth/types/api-key-resolver.type';
import { ClientType } from '@/modules/auth/types/client-type.type';
import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { API_KEY_RESOLVER } from '@/shared/tokens/api-key-resolver.token';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(
    @Inject(API_KEY_RESOLVER) private readonly apiKeyResolver: ApiKeyResolver,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<{
      headers: Record<string, string | string[] | undefined>;
      clientType?: ClientType;
    }>();
    const apiKey = request.headers['x-api-key'];

    if (!apiKey || typeof apiKey !== 'string') {
      throw new UnauthorizedException('API key is missing');
    }

    const clientType = this.apiKeyResolver.resolve(apiKey);

    if (!clientType) {
      throw new UnauthorizedException('Invalid API key');
    }

    request.clientType = clientType;

    return true;
  }
}
