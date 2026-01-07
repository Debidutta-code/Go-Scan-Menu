// Updated Express Types for Enhanced RBAC
import type {} from 'express-serve-static-core';
import { StaffRole, RolePermissions, AccessScope } from './role.types';
import { StaffType, IPermissions } from '../models/StaffTypePermissions.model';

/**
 * Authenticated user payload
 */
export interface AuthUser {
  id: string;
  email?: string;
  role?: StaffRole;
  roleId?: string;
  staffType: StaffType;  // ← Added
  restaurantId?: string;
  branchId?: string;
  accessScope?: AccessScope;
  allowedBranchIds?: string[];
  permissions?: RolePermissions | IPermissions;  // ← Updated
}

declare module 'express-serve-static-core' {
  interface Request {
    user?: AuthUser;
  }
}
