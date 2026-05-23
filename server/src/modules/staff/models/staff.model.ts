// src/models/Staff.model.ts
import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IStaff extends Document {
  restaurantId: Types.ObjectId;
  roleId: Types.ObjectId; // Reference to Role model
  name: string;
  email: string;
  phone: string;
  password: string;
  isActive: boolean;
  preferences?: {
    timePreference?: string;
    workingHours?: {
      start?: string;
      end?: string;
    };
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
    isActive: {
      type: Boolean,
      default: true,
    },
    preferences: {
      timePreference: { type: String, default: 'Mid-Day' },
      workingHours: {
        start: { type: String, default: '9:00 AM' },
        end: { type: String, default: '6:00 PM' },
      },
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
staffSchema.index({ restaurantId: 1, email: 1 }, { unique: true });
staffSchema.index({ restaurantId: 1, roleId: 1 });
staffSchema.index({ roleId: 1 });

export const Staff = mongoose.model<IStaff>('Staff', staffSchema);
