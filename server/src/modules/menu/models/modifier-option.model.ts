import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IModifierOption extends Document {
  restaurantId: Types.ObjectId;
  name: string;
  description?: string;
  price: number;
  isAvailable: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const modifierOptionSchema = new Schema<IModifierOption>(
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
    price: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    isAvailable: {
      type: Boolean,
      default: true,
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

modifierOptionSchema.index({ restaurantId: 1, name: 1 });

export const ModifierOption = mongoose.model<IModifierOption>('ModifierOption', modifierOptionSchema);
