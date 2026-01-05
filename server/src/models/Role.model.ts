// src/models/Role.model.ts
import { StaffRole } from '@/types/role.types';
import mongoose, { Schema, Document } from 'mongoose';

export interface IRole extends Document {
  name: StaffRole;
  displayName: string;
  description: string;
  permissions: {
    canViewOrders: boolean;
    canUpdateOrders: boolean;
    canManageMenu: boolean;
    canManageStaff: boolean;
    canViewReports: boolean;
    canManageSettings: boolean;
  };
  isSystemRole: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const roleSchema = new Schema<IRole>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      enum: ['owner', 'branch_manager', 'manager', 'waiter', 'kitchen_staff', 'cashier'],
      trim: true,
    },
    displayName: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    permissions: {
      canViewOrders: {
        type: Boolean,
        default: false,
      },
      canUpdateOrders: {
        type: Boolean,
        default: false,
      },
      canManageMenu: {
        type: Boolean,
        default: false,
      },
      canManageStaff: {
        type: Boolean,
        default: false,
      },
      canViewReports: {
        type: Boolean,
        default: false,
      },
      canManageSettings: {
        type: Boolean,
        default: false,
      },
    },
    isSystemRole: {
      type: Boolean,
      default: true,
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

// Indexes
roleSchema.index({ name: 1 });
roleSchema.index({ isActive: 1 });

export const Role = mongoose.model<IRole>('Role', roleSchema);
