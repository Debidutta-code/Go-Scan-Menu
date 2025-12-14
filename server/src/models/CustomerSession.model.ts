// src/models/CustomerSession.model.ts
import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ICustomerSession extends Document {
  restaurantId: Types.ObjectId;
  branchId: Types.ObjectId;
  tableId: Types.ObjectId;
  sessionId: string;
  themePreference: 'light' | 'dark';
  activeOrderId?: Types.ObjectId;
  startTime: Date;
  lastActivityTime: Date;
  endTime?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const customerSessionSchema = new Schema<ICustomerSession>(
  {
    restaurantId: {
      type: Schema.Types.ObjectId,
      ref: 'Restaurant',
      required: true
    },
    branchId: {
      type: Schema.Types.ObjectId,
      ref: 'Branch',
      required: true
    },
    tableId: {
      type: Schema.Types.ObjectId,
      ref: 'Table',
      required: true
    },
    sessionId: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    themePreference: {
      type: String,
      enum: ['light', 'dark'],
      default: 'light'
    },
    activeOrderId: {
      type: Schema.Types.ObjectId,
      ref: 'Order'
    },
    startTime: {
      type: Date,
      required: true,
      default: Date.now
    },
    lastActivityTime: {
      type: Date,
      required: true,
      default: Date.now
    },
    endTime: Date,
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
customerSessionSchema.index({ sessionId: 1 }, { unique: true });
customerSessionSchema.index({ branchId: 1, tableId: 1, isActive: 1 });

export const CustomerSession = mongoose.model<ICustomerSession>('CustomerSession', customerSessionSchema);