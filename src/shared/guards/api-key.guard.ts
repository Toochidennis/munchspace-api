import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(private configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<{
      headers: Record<string, string | string[] | undefined>;
      clientType?: 'CUSTOMER' | 'VENDOR' | 'RIDER' | 'ADMIN';
    }>();
    const apiKey = request.headers['x-api-key'];

    if (!apiKey || typeof apiKey !== 'string') {
      throw new UnauthorizedException('API key is missing');
    }

    const apiKeyMapString = this.configService.get<string>('API_KEY_MAP');

    if (!apiKeyMapString) {
      throw new UnauthorizedException('API key map is not configured');
    }

    const parsedApiKeyMap = JSON.parse(apiKeyMapString || '{}') as Record<
      string,
      'CUSTOMER' | 'VENDOR' | 'RIDER' | 'ADMIN'
    >;

    const clientType = parsedApiKeyMap[apiKey];

    if (!clientType) {
      throw new UnauthorizedException('Invalid API key');
    }

    request.clientType = clientType;

    return true;
  }
}
