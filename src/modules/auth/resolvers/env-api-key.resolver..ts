import { Injectable } from '@nestjs/common';
import { ClientType } from '@/modules/auth/types/client-type.type';
import { ApiKeyResolver } from '@/modules/auth/types/api-key-resolver.type';

@Injectable()
export class EnvApiKeyResolver implements ApiKeyResolver {
  private readonly apiKeyMap = new Map<string, ClientType>([
    [process.env.API_KEY_CUSTOMER!, 'CUSTOMER'],
    [process.env.API_KEY_VENDOR!, 'VENDOR'],
    [process.env.API_KEY_ADMIN!, 'ADMIN'],
    [process.env.API_KEY_RIDER!, 'RIDER'],
  ]);

  resolve(apiKey: string): ClientType | null {
    return this.apiKeyMap.get(apiKey) || null;
  }
}
