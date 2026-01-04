// src/types/staff.types.ts

export interface Staff {
  _id: string;
  restaurantId: string;
  branchId?: string;
  name: string;
  email: string;
  phone: string;
  role: 'owner' | 'branch_manager' | 'manager' | 'waiter' | 'kitchen_staff' | 'cashier';
  accessLevel: 'single_branch' | 'all_branches';
  allowedBranchIds: string[];
  permissions: {
    canViewOrders: boolean;
    canUpdateOrders: boolean;
    canManageMenu: boolean;
    canManageStaff: boolean;
    canViewReports: boolean;
    canManageSettings: boolean;
  };
  isActive: boolean;
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
  role: 'owner' | 'branch_manager' | 'manager' | 'waiter' | 'kitchen_staff' | 'cashier';
  accessLevel?: 'single_branch' | 'all_branches';
  allowedBranchIds?: string[];
}

export interface StaffListResponse {
  staff: Staff[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
