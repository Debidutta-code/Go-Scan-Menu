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
        branchId?: string;
        allowedBranchIds: string[];
        permissions: RolePermissions;
      };
    }
  }
}

export {};
