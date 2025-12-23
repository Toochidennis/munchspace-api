import { Role, AuthMethod } from '@prisma/client';

export interface AuthenticatedUser {
  userId: string;
  role: Role;
  authMethods: AuthMethod[];
}
