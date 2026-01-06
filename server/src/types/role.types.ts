// Enhanced Role Types for Industry Standard RBAC

export enum StaffRole {
  SUPER_ADMIN = 'super_admin',
  OWNER = 'owner',
  BRANCH_MANAGER = 'branch_manager',
  MANAGER = 'manager',
  WAITER = 'waiter',
  KITCHEN_STAFF = 'kitchen_staff',
  CASHIER = 'cashier',
}

export enum RoleLevel {
  PLATFORM = 1,      // SuperAdmin - platform level
  RESTAURANT = 2,    // Owner - restaurant level
  BRANCH_MULTI = 3,  // Branch Manager - multi-branch level
  BRANCH_SINGLE = 4, // Manager - single branch level
  OPERATIONAL = 5,   // Waiter, Kitchen, Cashier - operational level
}

export enum AccessScope {
  PLATFORM = 'platform',           // Access to entire platform
  RESTAURANT = 'restaurant',       // Access to all branches in restaurant
  BRANCH_MULTI = 'branch_multi',   // Access to specific multiple branches
  BRANCH_SINGLE = 'branch_single', // Access to single branch only
}

// Enhanced Granular Permissions (Industry Standard)
export interface RolePermissions {
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

// Role Template Definition
export interface RoleTemplate {
  name: StaffRole;
  displayName: string;
  description: string;
  level: RoleLevel;
  defaultAccessScope: AccessScope;
  permissions: RolePermissions;
}
