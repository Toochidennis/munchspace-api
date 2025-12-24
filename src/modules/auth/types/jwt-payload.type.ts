export interface JwtPayload {
  sub: string;
  capabilities: {
    customer: boolean;
    admin: boolean;
    rider: boolean;
    vendorIds: string[];
  };
  iat?: number;
  exp?: number;
}
