// SuperAdmin Model - Separated from Restaurant Role System
import mongoose, { Schema, Document } from 'mongoose';
import { RolePermissions } from '@/types/role.types';

export interface ISuperAdmin extends Document {
  name: string;
  email: string;
  password: string;
  permissions: RolePermissions; // Direct permissions, no roleId needed
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const superAdminSchema = new Schema<ISuperAdmin>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    // SuperAdmin has all permissions by default
    permissions: {
      orders: {
        view: { type: Boolean, default: true },
        create: { type: Boolean, default: true },
        update: { type: Boolean, default: true },
        delete: { type: Boolean, default: true },
        managePayment: { type: Boolean, default: true },
        viewAllBranches: { type: Boolean, default: true },
      },
      menu: {
        view: { type: Boolean, default: true },
        create: { type: Boolean, default: true },
        update: { type: Boolean, default: true },
        delete: { type: Boolean, default: true },
        manageCategories: { type: Boolean, default: true },
        managePricing: { type: Boolean, default: true },
      },
      staff: {
        view: { type: Boolean, default: true },
        create: { type: Boolean, default: true },
        update: { type: Boolean, default: true },
        delete: { type: Boolean, default: true },
        manageRoles: { type: Boolean, default: true },
      },
      reports: {
        view: { type: Boolean, default: true },
        export: { type: Boolean, default: true },
        viewFinancials: { type: Boolean, default: true },
      },
      settings: {
        view: { type: Boolean, default: true },
        updateRestaurant: { type: Boolean, default: true },
        updateBranch: { type: Boolean, default: true },
        manageTaxes: { type: Boolean, default: true },
      },
      tables: {
        view: { type: Boolean, default: true },
        create: { type: Boolean, default: true },
        update: { type: Boolean, default: true },
        delete: { type: Boolean, default: true },
        manageQR: { type: Boolean, default: true },
      },
      customers: {
        view: { type: Boolean, default: true },
        manage: { type: Boolean, default: true },
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

// Index for faster email lookups
superAdminSchema.index({ email: 1 });

export const SuperAdmin = mongoose.model<ISuperAdmin>('SuperAdmin', superAdminSchema);
