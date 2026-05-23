import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IStaff extends Document {
  restaurantId: Types.ObjectId;
  roleId: Types.ObjectId;
  name: string;
  email: string;
  phone: string;
  password: string;
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
  },
  {
    timestamps: true,
  }
);

staffSchema.index({ restaurantId: 1, email: 1 }, { unique: true });

export const Staff = mongoose.model<IStaff>('Staff', staffSchema);
