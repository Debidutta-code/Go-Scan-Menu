// src/models/Category.model.ts
import mongoose, { Schema, Document, Types } from 'mongoose';

// Import Restaurant interface if available
// import { IRestaurant } from './Restaurant.model';
// import { IBranch } from './Branch.model';

export interface ICategory extends Document {
  restaurantId: Types.ObjectId | any; // Allow any for populated documents
  branchId?: Types.ObjectId | any;
  name: string;
  description?: string;
  image?: string;
  displayOrder: number;
  scope: 'restaurant' | 'branch';
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const categorySchema = new Schema<ICategory>(
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
    image: {
      type: String,
      trim: true,
    },
    displayOrder: {
      type: Number,
      default: 0,
    },
    scope: {
      type: String,
      enum: ['restaurant', 'branch'],
      default: 'restaurant',
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

// Indexes
categorySchema.index({ restaurantId: 1, scope: 1, displayOrder: 1 });
categorySchema.index({ branchId: 1, displayOrder: 1 });

export const Category = mongoose.model<ICategory>('Category', categorySchema);
