import type {} from 'express-serve-static-core';

/**
 * Central role type
 */
export type UserRole =
  | 'super_admin'
  | 'owner'
  | 'branch_manager'
  | 'manager'
  | 'waiter'
  | 'kitchen_staff'
  | 'cashier';

/**
 * Permissions interface
 */
export interface UserPermissions {
  canViewOrders?: boolean;
  canUpdateOrders?: boolean;
  canManageMenu?: boolean;
  canManageStaff?: boolean;
  canViewReports?: boolean;
  canManageSettings?: boolean;
}

/**
 * Authenticated user payload
 */
export interface AuthUser {
  id: string;
  email?: string;
  role: UserRole;
  roleId?: string;
  restaurantId?: string;
  branchId?: string;

  accessLevel?: 'single_branch' | 'all_branches';
  allowedBranchIds?: string[];

  permissions?: UserPermissions;
}

declare module 'express-serve-static-core' {
  interface Request {
    user?: AuthUser;
  }
}
