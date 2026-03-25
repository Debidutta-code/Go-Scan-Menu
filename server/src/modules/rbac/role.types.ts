// server/src/modules/rbac/role.types.ts

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
  PLATFORM = 1, // SuperAdmin - platform level
  RESTAURANT = 2, // Owner - restaurant level
  BRANCH_MULTI = 3, // Branch Manager - multi-branch level
  BRANCH_SINGLE = 4, // Manager - single branch level
  OPERATIONAL = 5, // Waiter, Kitchen, Cashier - operational level
}

export enum AccessScope {
  PLATFORM = 'platform', // Access to entire platform
  RESTAURANT = 'restaurant', // Access to all branches in restaurant
  BRANCH_MULTI = 'branch_multi', // Access to specific multiple branches
  BRANCH_SINGLE = 'branch_single', // Access to single branch only
}

export interface PermissionModule {
  view: boolean;
  create: boolean;
  update: boolean;
  delete: boolean;
}

export interface OrderPermissions extends PermissionModule {
  managePayment: boolean;
  viewAllBranches: boolean;
}

export interface MenuPermissions extends PermissionModule {
  manageCategories: boolean;
  managePricing: boolean;
}

export interface StaffPermissions extends PermissionModule {
  manageRoles: boolean;
}

export interface SettingsPermissions {
  view: boolean;
  updateRestaurant: boolean;
  updateBranch: boolean;
  manageTaxes: boolean;
}

export interface TablePermissions extends PermissionModule {
  manageQR: boolean;
}

export interface RolePermissions {
  orders: OrderPermissions;
  menu: MenuPermissions;
  staff: StaffPermissions;
  reports: {
    view: boolean;
    export: boolean;
    viewFinancials: boolean;
  };
  settings: SettingsPermissions;
  tables: TablePermissions;
  customers: {
    view: boolean;
    manage: boolean;
  };
}

export interface RoleTemplate {
  name: StaffRole;
  displayName: string;
  description: string;
  level: RoleLevel;
  defaultAccessScope: AccessScope;
  permissions: RolePermissions;
}
