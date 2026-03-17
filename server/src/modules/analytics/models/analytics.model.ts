// src/models/Analytics.model.ts
import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IAnalytics extends Document {
  restaurantId: Types.ObjectId;
  branchId?: Types.ObjectId;
  date: Date;
  totalOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  topSellingItems: Array<{
    menuItemId: Types.ObjectId;
    name: string;
    quantity: number;
    revenue: number;
  }>;
  tableUtilization: Array<{
    tableId: Types.ObjectId;
    tableNumber: string;
    ordersServed: number;
  }>;
  createdAt: Date;
}

const analyticsSchema = new Schema<IAnalytics>(
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
    date: {
      type: Date,
      required: true,
    },
    totalOrders: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    completedOrders: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    cancelledOrders: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    totalRevenue: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    averageOrderValue: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    topSellingItems: [
      {
        menuItemId: {
          type: Schema.Types.ObjectId,
          ref: 'MenuItem',
          required: true,
        },
        name: {
          type: String,
          required: true,
          trim: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 0,
        },
        revenue: {
          type: Number,
          required: true,
          min: 0,
        },
      },
    ],
    tableUtilization: [
      {
        tableId: {
          type: Schema.Types.ObjectId,
          ref: 'Table',
          required: true,
        },
        tableNumber: {
          type: String,
          required: true,
          trim: true,
        },
        ordersServed: {
          type: Number,
          required: true,
          min: 0,
        },
      },
    ],
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

// Indexes
analyticsSchema.index({ restaurantId: 1, branchId: 1, date: -1 });

export const Analytics = mongoose.model<IAnalytics>('Analytics', analyticsSchema);
