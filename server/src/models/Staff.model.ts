// src/models/Staff.model.ts
import mongoose, { Schema, Document, Types } from 'mongoose';
import { StaffType } from './StaffTypePermissions.model';

export interface IStaff extends Document {
  restaurantId: Types.ObjectId;
  branchId?: Types.ObjectId; // Primary branch
  staffType: StaffType; // Changed from roleId to staffType
  name: string;
  email: string;
  phone: string;
  password: string;
  allowedBranchIds: Types.ObjectId[]; // For multi-branch access
  isActive: boolean;
  preferences?: {
    timePreference?: string;
    workingHours?: {
      start?: string;
      end?: string;
    }
  };
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
    staffType: {
      type: String,
      required: true,
      enum: Object.values(StaffType),
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
    preferences: {
      timePreference: { type: String, default: 'Mid-Day' },
      workingHours: {
        start: { type: String, default: '9:00 AM' },
        end: { type: String, default: '6:00 PM' }
      }
    }
  },
  {
    timestamps: true,
  }
);

// Indexes
staffSchema.index({ restaurantId: 1, email: 1 }, { unique: true });
staffSchema.index({ restaurantId: 1, branchId: 1, staffType: 1 });
staffSchema.index({ staffType: 1 });

export const Staff = mongoose.model<IStaff>('Staff', staffSchema);
