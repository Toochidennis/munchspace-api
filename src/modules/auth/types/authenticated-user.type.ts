export interface AuthenticatedUser {
  userId: string;
  capabilities: {
    customer: boolean;
    admin: boolean;
    rider: boolean;
    vendorIds: string[];
  };
}
