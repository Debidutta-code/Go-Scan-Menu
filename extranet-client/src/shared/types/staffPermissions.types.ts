// extranet-client/src/shared/types/staffPermissions.types.ts

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
  PLATFORM = 1,
  RESTAURANT = 2,
  BRANCH_MULTI = 3,
  BRANCH_SINGLE = 4,
  OPERATIONAL = 5,
}

export enum AccessScope {
  PLATFORM = 'platform',
  RESTAURANT = 'restaurant',
  BRANCH_MULTI = 'branch_multi',
  BRANCH_SINGLE = 'branch_single',
}

export interface IPermissions {
  orders: {
    view: boolean;
    create: boolean;
    update: boolean;
    delete: boolean;
    managePayment: boolean;
    viewAllBranches: boolean;
  };
  menu: {
    view: boolean;
    create: boolean;
    update: boolean;
    delete: boolean;
    manageCategories: boolean;
    managePricing: boolean;
  };
  staff: {
    view: boolean;
    create: boolean;
    update: boolean;
    delete: boolean;
    manageRoles: boolean;
  };
  reports: {
    view: boolean;
    export: boolean;
    viewFinancials: boolean;
  };
  settings: {
    view: boolean;
    updateRestaurant: boolean;
    updateBranch: boolean;
    manageTaxes: boolean;
  };
  tables: {
    view: boolean;
    create: boolean;
    update: boolean;
    delete: boolean;
    manageQR: boolean;
  };
  customers: {
    view: boolean;
    manage: boolean;
  };
}

export interface IRole {
  _id: string;
  name: StaffRole;
  displayName: string;
  description: string;
  level: RoleLevel;
  accessScope: AccessScope;
  restaurantId?: string;
  permissions: IPermissions;
  isSystemRole: boolean;
  isActive: boolean;
}

export interface UpdatePermissionsPayload {
  permissions: IPermissions;
}
