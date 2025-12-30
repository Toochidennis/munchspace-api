import { ClientType } from '@/modules/auth/types/client-type.type';

export interface ApiKeyResolver {
  resolve(apiKey: string): ClientType | null;
}
