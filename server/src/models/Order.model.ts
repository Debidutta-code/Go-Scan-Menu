// src/models/Order.model.ts
import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IOrder extends Document {
  restaurantId: Types.ObjectId;
  branchId: Types.ObjectId;
  tableId: Types.ObjectId;
  tableNumber: string;
  orderNumber: string;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  items: Array<{
    menuItemId: Types.ObjectId;
    name: string;
    image?: string;
    quantity: number;
    price: number;
    variant?: {
      name: string;
      price: number;
    };
    addons: Array<{
      name: string;
      price: number;
    }>;
    customizations: Array<{
      name: string;
      value: string;
    }>;
    specialInstructions?: string;
    itemTotal: number;
    status: 'pending' | 'preparing' | 'prepared' | 'served';
  }>;
  subtotal: number;
  taxAmount: number;
  taxPercentage: number;
  serviceChargeAmount: number;
  serviceChargePercentage: number;
  discountAmount: number;
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'served' | 'completed' | 'cancelled';
  orderType: 'dine-in' | 'takeaway';
  paymentStatus: 'pending' | 'paid' | 'failed';
  paymentMethod?: 'cash' | 'card' | 'upi' | 'wallet' | 'online';
  specialInstructions?: string;
  assignedStaffId?: Types.ObjectId;
  assignedStaffName?: string;
  orderTime: Date;
  confirmedAt?: Date;
  preparingAt?: Date;
  readyAt?: Date;
  servedAt?: Date;
  completedAt?: Date;
  cancelledAt?: Date;
  cancellationReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const orderSchema = new Schema<IOrder>(
  {
    restaurantId: {
      type: Schema.Types.ObjectId,
      ref: 'Restaurant',
      required: true,
    },
    branchId: {
      type: Schema.Types.ObjectId,
      ref: 'Branch',
      required: true,
    },
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
    orderNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    customerName: {
      type: String,
      trim: true,
    },
    customerPhone: {
      type: String,
      trim: true,
    },
    customerEmail: {
      type: String,
      lowercase: true,
      trim: true,
    },
    items: [
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
        image: {
          type: String,
          trim: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
        price: {
          type: Number,
          required: true,
          min: 0,
        },
        variant: {
          name: {
            type: String,
            trim: true,
          },
          price: {
            type: Number,
            min: 0,
          },
        },
        addons: [
          {
            name: {
              type: String,
              required: true,
              trim: true,
            },
            price: {
              type: Number,
              required: true,
              min: 0,
            },
          },
        ],
        customizations: [
          {
            name: {
              type: String,
              required: true,
              trim: true,
            },
            value: {
              type: String,
              required: true,
              trim: true,
            },
          },
        ],
        specialInstructions: {
          type: String,
          trim: true,
        },
        itemTotal: {
          type: Number,
          required: true,
          min: 0,
        },
        status: {
          type: String,
          enum: ['pending', 'preparing', 'prepared', 'served'],
          default: 'pending',
        },
      },
    ],
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
    taxAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    taxPercentage: {
      type: Number,
      required: true,
      min: 0,
    },
    serviceChargeAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    serviceChargePercentage: {
      type: Number,
      required: true,
      min: 0,
    },
    discountAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'preparing', 'ready', 'served', 'completed', 'cancelled'],
      default: 'pending',
    },
    orderType: {
      type: String,
      enum: ['dine-in', 'takeaway'],
      default: 'dine-in',
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed'],
      default: 'pending',
    },
    paymentMethod: {
      type: String,
      enum: ['cash', 'card', 'upi', 'wallet', 'online'],
    },
    specialInstructions: {
      type: String,
      trim: true,
    },
    assignedStaffId: {
      type: Schema.Types.ObjectId,
      ref: 'Staff',
    },
    assignedStaffName: {
      type: String,
      trim: true,
    },
    orderTime: {
      type: Date,
      required: true,
      default: Date.now,
    },
    confirmedAt: Date,
    preparingAt: Date,
    readyAt: Date,
    servedAt: Date,
    completedAt: Date,
    cancelledAt: Date,
    cancellationReason: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
orderSchema.index({ branchId: 1, status: 1, orderTime: -1 });
orderSchema.index({ restaurantId: 1, orderTime: -1 });
orderSchema.index({ orderNumber: 1 }, { unique: true });

export const Order = mongoose.model<IOrder>('Order', orderSchema);
