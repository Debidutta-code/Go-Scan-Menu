// extranet-client/src/shared/types/staff.types.ts

import { StaffRole, IPermissions, AccessScope } from './staffPermissions.types';

export interface RestaurantInfo {
  _id: string;
  name: string;
  type: 'single' | 'chain';
  slug: string;
}

export interface Staff {
  _id: string;
  restaurantId: any;
  branchId?: string;
  name: string;
  email: string;
  phone: string;
  role: StaffRole;
  roleId: string;
  accessScope: AccessScope;
  allowedBranchIds: string[];
  isActive: boolean;
  preferences?: {
    timePreference?: string;
    workingHours?: {
      start?: string;
      end?: string;
    };
  };
  permissions?: IPermissions;
  restaurant?: RestaurantInfo;
  createdAt: string;
  updatedAt: string;
}

export interface StaffLoginResponse {
  staff: Staff;
  token: string;
}

export interface CreateStaffPayload {
  restaurantId: string;
  branchId?: string;
  name: string;
  email: string;
  phone: string;
  password: string;
  roleId: string;
  allowedBranchIds?: string[];
}

export interface UpdateStaffPayload {
  name?: string;
  email?: string;
  phone?: string;
  roleId?: string;
  branchId?: string;
  allowedBranchIds?: string[];
  isActive?: boolean;
}

export interface StaffListResponse {
  staff: Staff[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
