import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IModifierGroup extends Document {
  restaurantId: Types.ObjectId;
  name: string;
  description?: string;
  type: 'modifier' | 'size';
  minSelections: number;
  maxSelections: number;
  isRequired: boolean;
  isMultiSelect: boolean;
  options: Types.ObjectId[]; // References to ModifierOption
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const modifierGroupSchema = new Schema<IModifierGroup>(
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
      enum: ['modifier', 'size'],
      default: 'modifier',
    },
    minSelections: {
      type: Number,
      default: 0,
      min: 0,
    },
    maxSelections: {
      type: Number,
      default: 1,
      min: 1,
    },
    isRequired: {
      type: Boolean,
      default: false,
    },
    isMultiSelect: {
      type: Boolean,
      default: false,
    },
    options: [
      {
        type: Schema.Types.ObjectId,
        ref: 'ModifierOption',
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

modifierGroupSchema.index({ restaurantId: 1, name: 1 });

export const ModifierGroup = mongoose.model<IModifierGroup>('ModifierGroup', modifierGroupSchema);
