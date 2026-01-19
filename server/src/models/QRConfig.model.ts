// src/models/QRConfig.model.ts
import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IQRConfig extends Document {
  restaurantId: Types.ObjectId;
  designMode: 'simple' | 'template';
  selectedStyle: string;
  selectedTemplate: string;
  customMode: boolean;
  fgColor: string;
  bgColor: string;
  level: 'L' | 'M' | 'Q' | 'H';
  logoSrc?: string;
  logoWidth?: number;
  logoHeight?: number;
  selectedCategory: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const qrConfigSchema = new Schema<IQRConfig>(
  {
    restaurantId: {
      type: Schema.Types.ObjectId,
      ref: 'Restaurant',
      required: true,
      unique: true, // One config per restaurant
    },
    designMode: {
      type: String,
      enum: ['simple', 'template'],
      default: 'simple',
    },
    selectedStyle: {
      type: String,
      default: 'classic',
    },
    selectedTemplate: {
      type: String,
      default: 'classic_tent',
    },
    customMode: {
      type: Boolean,
      default: false,
    },
    fgColor: {
      type: String,
      default: '#000000',
    },
    bgColor: {
      type: String,
      default: '#ffffff',
    },
    level: {
      type: String,
      enum: ['L', 'M', 'Q', 'H'],
      default: 'H',
    },
    logoSrc: {
      type: String,
      default: undefined,
    },
    logoWidth: {
      type: Number,
      default: undefined,
    },
    logoHeight: {
      type: Number,
      default: undefined,
    },
    selectedCategory: {
      type: String,
      default: 'all',
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

// Index
qrConfigSchema.index({ restaurantId: 1 });

export const QRConfig = mongoose.model<IQRConfig>('QRConfig', qrConfigSchema);
