// src/types/staffPermissions.types.ts

export enum StaffType {
  SUPER_ADMIN = 'super_admin',
  OWNER = 'owner',
  BRANCH_MANAGER = 'branch_manager',
  MANAGER = 'manager',
  WAITER = 'waiter',
  KITCHEN_STAFF = 'kitchen_staff',
  CASHIER = 'cashier',
}

export interface IPermissions {
  // Order Management
  orders: {
    view: boolean;
    create: boolean;
    update: boolean;
    delete: boolean;
    managePayment: boolean;
    viewAllBranches: boolean;
  };
  
  // Menu Management
  menu: {
    view: boolean;
    create: boolean;
    update: boolean;
    delete: boolean;
    manageCategories: boolean;
    managePricing: boolean;
  };
  
  // Staff Management
  staff: {
    view: boolean;
    create: boolean;
    update: boolean;
    delete: boolean;
    manageRoles: boolean;
  };
  
  // Reports & Analytics
  reports: {
    view: boolean;
    export: boolean;
    viewFinancials: boolean;
  };
  
  // Settings Management
  settings: {
    view: boolean;
    updateRestaurant: boolean;
    updateBranch: boolean;
    manageTaxes: boolean;
  };
  
  // Table Management
  tables: {
    view: boolean;
    create: boolean;
    update: boolean;
    delete: boolean;
    manageQR: boolean;
  };
  
  // Customer Management
  customers: {
    view: boolean;
    manage: boolean;
  };
}

export interface IStaffTypePermissions {
  _id: string;
  restaurantId: string;
  staffType: StaffType;
  permissions: IPermissions;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UpdatePermissionsPayload {
  permissions: IPermissions;
}
