import { Role, AuthType } from '../../../../generated/prisma/client';

export interface JwtPayload {
  sub: string; // user ID
  role: Role;
  authType: AuthType;
  iat?: number;
  exp?: number;
}
