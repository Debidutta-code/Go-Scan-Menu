// Extended Express Request types
import { StaffType, IPermissions } from '../models/StaffTypePermissions.model';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        staffType: StaffType;
        restaurantId: string;
        branchId?: string;
        allowedBranchIds: string[];
        permissions: IPermissions;
      };
    }
  }
}

export {};
