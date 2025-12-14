// src/models/Staff.model.ts
import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IStaff extends Document {
  restaurantId: Types.ObjectId;
  branchId?: Types.ObjectId;
  name: string;
  email: string;
  phone: string;
  password: string;
  role: 'owner' | 'branch_manager' | 'manager' | 'waiter' | 'kitchen_staff' | 'cashier';
  accessLevel: 'single_branch' | 'all_branches';
  allowedBranchIds: Types.ObjectId[];
  permissions: {
    canViewOrders: boolean;
    canUpdateOrders: boolean;
    canManageMenu: boolean;
    canManageStaff: boolean;
    canViewReports: boolean;
    canManageSettings: boolean;
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const staffSchema = new Schema<IStaff>(
  {
    restaurantId: {
      type: Schema.Types.ObjectId,
      ref: 'Restaurant',
      required: true
    },
    branchId: {
      type: Schema.Types.ObjectId,
      ref: 'Branch'
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true
    },
    phone: {
      type: String,
      required: true,
      trim: true
    },
    password: {
      type: String,
      required: true
    },
    role: {
      type: String,
      enum: ['owner', 'branch_manager', 'manager', 'waiter', 'kitchen_staff', 'cashier'],
      required: true
    },
    accessLevel: {
      type: String,
      enum: ['single_branch', 'all_branches'],
      default: 'single_branch'
    },
    allowedBranchIds: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Branch'
      }
    ],
    permissions: {
      canViewOrders: {
        type: Boolean,
        default: false
      },
      canUpdateOrders: {
        type: Boolean,
        default: false
      },
      canManageMenu: {
        type: Boolean,
        default: false
      },
      canManageStaff: {
        type: Boolean,
        default: false
      },
      canViewReports: {
        type: Boolean,
        default: false
      },
      canManageSettings: {
        type: Boolean,
        default: false
      }
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

// Indexes
staffSchema.index({ restaurantId: 1, email: 1 }, { unique: true });
staffSchema.index({ restaurantId: 1, branchId: 1, role: 1 });

export const Staff = mongoose.model<IStaff>('Staff', staffSchema);