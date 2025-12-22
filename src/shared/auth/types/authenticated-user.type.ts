import { Role, AuthType } from '@prisma/client';

export interface AuthenticatedUser {
  userId: string;
  role: Role;
  authType: AuthType;
}
