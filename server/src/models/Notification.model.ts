// src/models/Notification.model.ts
import mongoose, { Schema, Document, Types } from 'mongoose';

export interface INotification extends Document {
  restaurantId: Types.ObjectId;
  branchId: Types.ObjectId;
  recipientId: Types.ObjectId;
  recipientRole: 'owner' | 'branch_manager' | 'manager' | 'waiter' | 'kitchen_staff' | 'cashier';
  type: 'new_order' | 'order_update' | 'table_call';
  title: string;
  message: string;
  relatedOrderId?: Types.ObjectId;
  relatedTableId?: Types.ObjectId;
  isRead: boolean;
  readAt?: Date;
  createdAt: Date;
}

const notificationSchema = new Schema<INotification>(
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
    recipientId: {
      type: Schema.Types.ObjectId,
      ref: 'Staff',
      required: true
    },
    recipientRole: {
      type: String,
      enum: ['owner', 'branch_manager', 'manager', 'waiter', 'kitchen_staff', 'cashier'],
      required: true
    },
    type: {
      type: String,
      enum: ['new_order', 'order_update', 'table_call'],
      required: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    message: {
      type: String,
      required: true,
      trim: true
    },
    relatedOrderId: {
      type: Schema.Types.ObjectId,
      ref: 'Order'
    },
    relatedTableId: {
      type: Schema.Types.ObjectId,
      ref: 'Table'
    },
    isRead: {
      type: Boolean,
      default: false
    },
    readAt: Date
  },
  {
    timestamps: { createdAt: true, updatedAt: false }
  }
);

// Indexes
notificationSchema.index({ branchId: 1, recipientId: 1, isRead: 1, createdAt: -1 });

export const Notification = mongoose.model<INotification>('Notification', notificationSchema);