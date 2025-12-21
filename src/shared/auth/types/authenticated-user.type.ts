import { Role, AuthType } from '../../../../generated/prisma/client';

export interface AuthenticatedUser {
  userId: string;
  role: Role;
  authType: AuthType;
}
