// src/models/Tax.model.ts
import mongoose, { Schema, Document, Types } from 'mongoose';

import { ITax } from '@/types/tax.types';

export { ITax };

const taxSchema = new Schema<ITax>(
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
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    taxType: {
      type: String,
      enum: ['percentage', 'fixed'],
      default: 'percentage',
    },
    value: {
      type: Number,
      required: true,
      min: 0,
    },
    applicableOn: {
      type: String,
      enum: ['subtotal', 'item_total', 'after_other_taxes'],
      default: 'subtotal',
    },
    scope: {
      type: String,
      enum: ['restaurant', 'branch'],
      default: 'restaurant',
    },
    category: {
      type: String,
      enum: ['food_tax', 'service_tax', 'room_tax', 'luxury_tax', 'other'],
      default: 'food_tax',
    },
    conditions: {
      orderType: [
        {
          type: String,
          enum: ['dine-in', 'takeaway'],
        },
      ],
      minOrderAmount: {
        type: Number,
        min: 0,
      },
      maxOrderAmount: {
        type: Number,
        min: 0,
      },
      specificItems: [
        {
          type: Schema.Types.ObjectId,
          ref: 'MenuItem',
        },
      ],
      specificCategories: [
        {
          type: Schema.Types.ObjectId,
          ref: 'Category',
        },
      ],
    },
    isPartOfGroup: {
      type: Boolean,
      default: false,
    },
    groupName: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    displayOrder: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
taxSchema.index({ restaurantId: 1, scope: 1, isActive: 1 });
taxSchema.index({ branchId: 1, isActive: 1 });
taxSchema.index({ restaurantId: 1, category: 1 });

export const Tax = mongoose.model<ITax>('Tax', taxSchema);
