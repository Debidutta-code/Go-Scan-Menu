// src/models/Tax.model.ts
import mongoose, { Schema } from 'mongoose';

import { ITax } from '@/types/tax.types';

export { ITax };

const taxSchema = new Schema<ITax>(
  {
    restaurantId: {
      type: Schema.Types.ObjectId,
      ref: 'Restaurant',
      required: true,
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
    type: {
      type: String,
      enum: ['tax', 'group'],
      default: 'tax',
    },
    taxType: {
      type: String,
      enum: ['percentage', 'fixed'],
    },
    value: {
      type: Number,
      min: 0,
    },
    applicableOn: {
      type: String,
      enum: ['subtotal', 'item_total', 'after_other_taxes'],
      default: 'subtotal',
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
    parentId: {
      type: Schema.Types.ObjectId,
      ref: 'Tax',
    },
    // Keep for backward compatibility during transition if needed
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
taxSchema.index({ restaurantId: 1, isActive: 1 });
taxSchema.index({ restaurantId: 1, category: 1 });
taxSchema.index({ parentId: 1 });

export const Tax = mongoose.model<ITax>('Tax', taxSchema);
