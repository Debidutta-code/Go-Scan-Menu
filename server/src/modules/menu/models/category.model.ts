// src/models/Category.model.ts
import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ICategory extends Document {
  restaurantId: Types.ObjectId;
  name: string;
  description?: string;
  image?: string;
  displayOrder: number;
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
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

categorySchema.index({ restaurantId: 1, isActive: 1 });

export const Category = mongoose.model<ICategory>('Category', categorySchema);
