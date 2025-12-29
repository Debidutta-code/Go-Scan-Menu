// src/models/Tax.model.ts
import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ITax extends Document {
  restaurantId: Types.ObjectId;
  branchId?: Types.ObjectId; // null = applies to all branches, specific ID = branch-specific tax
  name: string; // e.g., "CGST", "SGST", "GST", "VAT", "Service Tax", "Room Tax"
  description?: string;
  taxType: 'percentage' | 'fixed'; // percentage-based or fixed amount
  value: number; // percentage (e.g., 9, 18) or fixed amount (e.g., 50)
  applicableOn: 'subtotal' | 'item_total' | 'after_other_taxes'; // when to apply this tax
  scope: 'restaurant' | 'branch'; // restaurant-wide or branch-specific
  category: 'food_tax' | 'service_tax' | 'room_tax' | 'luxury_tax' | 'other'; // tax category

  // Conditional application rules
  conditions?: {
    orderType?: ('dine-in' | 'takeaway')[]; // apply only for specific order types
    minOrderAmount?: number; // apply only if order amount is above this
    maxOrderAmount?: number; // apply only if order amount is below this
    specificItems?: Types.ObjectId[]; // apply only for specific menu items (references MenuItem)
    specificCategories?: Types.ObjectId[]; // apply only for specific categories (references Category)
  };

  // Tax grouping (for combined display like CGST+SGST = GST)
  isPartOfGroup?: boolean;
  groupName?: string; // e.g., "GST" (for CGST+SGST combined display)

  isActive: boolean;
  displayOrder: number; // order in which taxes are displayed on receipt
  createdAt: Date;
  updatedAt: Date;
}

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
