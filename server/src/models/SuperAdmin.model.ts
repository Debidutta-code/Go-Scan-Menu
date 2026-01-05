// src/models/SuperAdmin.model.ts
import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ISuperAdmin extends Document {
  name: string;
  email: string;
  password: string;
  roleId: Types.ObjectId;
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
    roleId: {
      type: Schema.Types.ObjectId,
      ref: 'Role',
      required: true,
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
superAdminSchema.index({ roleId: 1 });

export const SuperAdmin = mongoose.model<ISuperAdmin>('SuperAdmin', superAdminSchema);