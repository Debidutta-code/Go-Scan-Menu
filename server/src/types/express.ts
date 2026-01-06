// Updated Express Types for Enhanced RBAC
import type {} from 'express-serve-static-core';
import { StaffRole, RolePermissions, AccessScope } from './role.types';

/**
 * Authenticated user payload
 */
export interface AuthUser {
  id: string;
  email?: string;
  role: StaffRole;
  roleId?: string;
  restaurantId?: string;
  branchId?: string;
  accessScope?: AccessScope;
  allowedBranchIds?: string[];
  permissions?: RolePermissions;
}

declare module 'express-serve-static-core' {
  interface Request {
    user?: AuthUser;
  }
}
