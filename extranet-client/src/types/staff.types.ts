// src/types/staff.types.ts

import { StaffType, IPermissions } from './staffPermissions.types';

export interface RestaurantInfo {
  _id: string;
  name: string;
  type: 'single' | 'chain';
  slug: string;
}

export interface Staff {
  _id: string;
  restaurantId: string;
  branchId?: string;
  name: string;
  email: string;
  phone: string;
  staffType: StaffType; // Changed from role to staffType
  allowedBranchIds: string[];
  isActive: boolean;
  permissions?: IPermissions; // Added permissions from backend response
  restaurant?: RestaurantInfo; // Restaurant details
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
  staffType: StaffType;
  allowedBranchIds?: string[];
}

export interface UpdateStaffPayload {
  name?: string;
  email?: string;
  phone?: string;
  staffType?: StaffType;
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