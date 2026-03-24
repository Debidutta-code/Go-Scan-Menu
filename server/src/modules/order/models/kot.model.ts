import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IKOT extends Document {
  restaurantId: Types.ObjectId;
  branchId: Types.ObjectId;
  orderId: Types.ObjectId;
  kotNumber: string;
  orderNumber: string;
  tableNumber: string;
  customerName?: string;
  items: Array<{
    menuItemId: Types.ObjectId;
    name: string;
    quantity: number;
    variant?: {
      name: string;
    };
    addons: Array<{
      name: string;
    }>;
    customizations: Array<{
      name: string;
      value: string;
    }>;
    specialInstructions?: string;
  }>;
  orderType: 'dine-in' | 'takeaway';
  orderTime: Date;
  status: 'pending' | 'preparing' | 'ready' | 'served';
  createdAt: Date;
  updatedAt: Date;
}

const kotSchema = new Schema<IKOT>(
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
    orderId: {
      type: Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
    },
    kotNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    orderNumber: {
      type: String,
      required: true,
      trim: true,
    },
    tableNumber: {
      type: String,
      required: true,
      trim: true,
    },
    customerName: {
      type: String,
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
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
        variant: {
          name: {
            type: String,
            trim: true,
          },
        },
        addons: [
          {
            name: {
              type: String,
              required: true,
              trim: true,
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
      },
    ],
    orderType: {
      type: String,
      enum: ['dine-in', 'takeaway'],
      required: true,
    },
    orderTime: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'preparing', 'ready', 'served'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
  }
);

kotSchema.index({ branchId: 1, kotNumber: 1 });
kotSchema.index({ orderId: 1 });

export const KOT = mongoose.model<IKOT>('KOT', kotSchema);
