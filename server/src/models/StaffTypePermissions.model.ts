// Staff Type Permissions Model - Restaurant-Specific
import mongoose, { Schema, Document, Types } from 'mongoose';

// Staff Type Enum
export enum StaffType {
  SUPER_ADMIN = 'super_admin',
  OWNER = 'owner',
  BRANCH_MANAGER = 'branch_manager',
  MANAGER = 'manager',
  WAITER = 'waiter',
  KITCHEN_STAFF = 'kitchen_staff',
  CASHIER = 'cashier',
}

// Granular Permissions Structure
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

export interface IStaffTypePermissions extends Document {
  restaurantId: Types.ObjectId;
  staffType: StaffType;
  permissions: IPermissions;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const staffTypePermissionsSchema = new Schema<IStaffTypePermissions>(
  {
    restaurantId: {
      type: Schema.Types.ObjectId,
      ref: 'Restaurant',
      required: true,
    },
    staffType: {
      type: String,
      required: true,
      enum: Object.values(StaffType),
    },
    permissions: {
      orders: {
        view: { type: Boolean, default: false },
        create: { type: Boolean, default: false },
        update: { type: Boolean, default: false },
        delete: { type: Boolean, default: false },
        managePayment: { type: Boolean, default: false },
        viewAllBranches: { type: Boolean, default: false },
      },
      menu: {
        view: { type: Boolean, default: false },
        create: { type: Boolean, default: false },
        update: { type: Boolean, default: false },
        delete: { type: Boolean, default: false },
        manageCategories: { type: Boolean, default: false },
        managePricing: { type: Boolean, default: false },
      },
      staff: {
        view: { type: Boolean, default: false },
        create: { type: Boolean, default: false },
        update: { type: Boolean, default: false },
        delete: { type: Boolean, default: false },
        manageRoles: { type: Boolean, default: false },
      },
      reports: {
        view: { type: Boolean, default: false },
        export: { type: Boolean, default: false },
        viewFinancials: { type: Boolean, default: false },
      },
      settings: {
        view: { type: Boolean, default: false },
        updateRestaurant: { type: Boolean, default: false },
        updateBranch: { type: Boolean, default: false },
        manageTaxes: { type: Boolean, default: false },
      },
      tables: {
        view: { type: Boolean, default: false },
        create: { type: Boolean, default: false },
        update: { type: Boolean, default: false },
        delete: { type: Boolean, default: false },
        manageQR: { type: Boolean, default: false },
      },
      customers: {
        view: { type: Boolean, default: false },
        manage: { type: Boolean, default: false },
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Unique index: one permission set per staff type per restaurant
staffTypePermissionsSchema.index({ restaurantId: 1, staffType: 1 }, { unique: true });

export const StaffTypePermissions = mongoose.model<IStaffTypePermissions>(
  'StaffTypePermissions',
  staffTypePermissionsSchema
);
