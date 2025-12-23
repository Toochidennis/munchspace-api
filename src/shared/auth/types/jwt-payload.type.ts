import { Role, AuthMethod } from '@prisma/client';

export interface JwtPayload {
  sub: string; // user ID
  role: Role;
  authMethods: AuthMethod[];
  iat?: number;
  exp?: number;
}
