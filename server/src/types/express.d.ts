// server/src/types/express.d.ts
import { StaffRole, RolePermissions } from '../modules/rbac/role.types';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: StaffRole;
        roleId?: string;
        restaurantId?: string;
        branchId?: string;
        allowedBranchIds?: string[];
        permissions: RolePermissions;
      };
    }
  }
}

export {};
