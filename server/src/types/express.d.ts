// Extended Express Request types
import { StaffRole, RolePermissions } from './role.types';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: StaffRole;
        roleId?: string;
        restaurantId: string;
        permissions: RolePermissions;
      };
    }
  }
}

export {};
