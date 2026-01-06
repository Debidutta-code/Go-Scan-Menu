// Enhanced Role Model - Industry Standard
import { StaffRole, RoleLevel, AccessScope, RolePermissions } from '@/types/role.types';
import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IRole extends Document {
  name: StaffRole;
  displayName: string;
  description: string;
  level: RoleLevel;
  accessScope: AccessScope;
  restaurantId?: Types.ObjectId; // null for system roles, set for restaurant-specific
  permissions: RolePermissions;
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
      enum: Object.values(StaffRole),
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
    level: {
      type: Number,
      required: true,
      enum: Object.values(RoleLevel),
    },
    accessScope: {
      type: String,
      required: true,
      enum: Object.values(AccessScope),
    },
    restaurantId: {
      type: Schema.Types.ObjectId,
      ref: 'Restaurant',
      default: null, // null means system-wide role
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
    isSystemRole: {
      type: Boolean,
      default: false,
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
roleSchema.index({ name: 1, restaurantId: 1 });
roleSchema.index({ restaurantId: 1, isActive: 1 });
roleSchema.index({ isSystemRole: 1, isActive: 1 });

export const Role = mongoose.model<IRole>('Role', roleSchema);
