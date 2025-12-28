// src/models/MenuItem.model.ts
import mongoose, { Schema, Document, Types } from 'mongoose';
import { NextFunction } from 'express';

export interface IMenuItem extends Document {
  restaurantId: Types.ObjectId;
  branchId?: Types.ObjectId;
  categoryId: Types.ObjectId;
  name: string;
  description?: string;
  image?: string;
  images: string[];
  price: number;
  discountPrice?: number;
  scope: 'restaurant' | 'branch';
  branchPricing: Array<{
    branchId: Types.ObjectId;
    price: number;
    discountPrice?: number;
    isAvailable: boolean;
  }>;
  preparationTime?: number;
  calories?: number;
  spiceLevel?: 'mild' | 'medium' | 'hot' | 'extra_hot';
  tags: string[];
  allergens: string[];
  variants: Array<{
    name: string;
    price: number;
    isDefault: boolean;
  }>;
  addons: Array<{
    name: string;
    price: number;
  }>;
  customizations: Array<{
    name: string;
    options: string[];
    isRequired: boolean;
  }>;
  isAvailable: boolean;
  availableQuantity?: number;
  isActive: boolean;
  displayOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

const menuItemSchema = new Schema<IMenuItem>(
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
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
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
    image: {
      type: String,
      trim: true,
    },
    images: [
      {
        type: String,
        trim: true,
      },
    ],
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    discountPrice: {
      type: Number,
      min: 0,
    },
    scope: {
      type: String,
      enum: ['restaurant', 'branch'],
      default: 'restaurant',
    },
    branchPricing: [
      {
        branchId: {
          type: Schema.Types.ObjectId,
          ref: 'Branch',
          required: true,
        },
        price: {
          type: Number,
          required: true,
          min: 0,
        },
        discountPrice: {
          type: Number,
          min: 0,
        },
        isAvailable: {
          type: Boolean,
          default: true,
        },
      },
    ],
    preparationTime: {
      type: Number,
      min: 0,
    },
    calories: {
      type: Number,
      min: 0,
    },
    spiceLevel: {
      type: String,
      enum: ['mild', 'medium', 'hot', 'extra_hot'],
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    allergens: [
      {
        type: String,
        trim: true,
      },
    ],
    variants: [
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
        isDefault: {
          type: Boolean,
          default: false,
        },
      },
    ],
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
        options: [
          {
            type: String,
            trim: true,
          },
        ],
        isRequired: {
          type: Boolean,
          default: false,
        },
      },
    ],
    isAvailable: {
      type: Boolean,
      default: true,
    },
    availableQuantity: {
      type: Number,
      min: 0,
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
menuItemSchema.index({ restaurantId: 1, categoryId: 1, scope: 1, isActive: 1 });
menuItemSchema.index({ branchId: 1, isAvailable: 1 });

// Validation: Ensure scope consistency and pricing logic
menuItemSchema.pre('save', async function (this: IMenuItem) {
  const item = this;

  if (item.scope === 'branch' && !item.branchId) {
    throw new Error('Branch-scoped menu items must have a branchId');
  }

  if (item.scope === 'restaurant' && item.branchId) {
    throw new Error('Restaurant-scoped menu items cannot have a branchId');
  }

  if (item.scope === 'branch' && item.branchPricing?.length) {
    throw new Error('Branch-scoped items should not have branchPricing array');
  }

  if (item.isModified('categoryId') || item.isModified('scope') || item.isNew) {
    const Category = mongoose.model('Category');
    const category: any = await Category.findById(item.categoryId);

    if (!category) {
      throw new Error('Category not found');
    }

    if (
      item.scope === 'branch' &&
      (category.scope !== 'branch' ||
        category.branchId?.toString() !== item.branchId?.toString())
    ) {
      throw new Error(
        'Branch-scoped items must belong to a branch-scoped category in the same branch'
      );
    }

    if (item.scope === 'restaurant' && category.scope !== 'restaurant') {
      throw new Error(
        'Restaurant-scoped items must belong to a restaurant-scoped category'
      );
    }
  }
});



export const MenuItem = mongoose.model<IMenuItem>('MenuItem', menuItemSchema);
