// src/models/Staff.model.ts
import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IStaff extends Document {
  restaurantId: Types.ObjectId;
  branchId?: Types.ObjectId;
  roleId: Types.ObjectId;
  name: string;
  email: string;
  phone: string;
  password: string;
  accessLevel: 'single_branch' | 'all_branches';
  allowedBranchIds: Types.ObjectId[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const staffSchema = new Schema<IStaff>(
  {
    restaurantId: {
      type: Schema.Types.ObjectId,
      ref: 'Restaurant',
      required: true,
    },
    branchId: {
      type: Schema.Types.ObjectId,
      ref: 'Branch',
    },
    roleId: {
      type: Schema.Types.ObjectId,
      ref: 'Role',
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    accessLevel: {
      type: String,
      enum: ['single_branch', 'all_branches'],
      default: 'single_branch',
    },
    allowedBranchIds: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Branch',
      },
    ],
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
staffSchema.index({ restaurantId: 1, email: 1 }, { unique: true });
staffSchema.index({ restaurantId: 1, branchId: 1, roleId: 1 });
staffSchema.index({ roleId: 1 });

export const Staff = mongoose.model<IStaff>('Staff', staffSchema);
