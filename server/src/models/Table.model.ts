// src/models/Table.model.ts
import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ITable extends Document {
  restaurantId: Types.ObjectId;
  branchId: Types.ObjectId;
  tableNumber: string;
  qrCode: string;
  capacity: number;
  location: 'indoor' | 'outdoor' | 'balcony' | 'rooftop' | 'private room';
  status: 'available' | 'occupied' | 'reserved' | 'maintenance';
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const tableSchema = new Schema<ITable>(
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
    tableNumber: {
      type: String,
      required: true,
      trim: true
    },
    qrCode: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    capacity: {
      type: Number,
      required: true,
      min: 1
    },
    location: {
      type: String,
      enum: ['indoor', 'outdoor', 'balcony', 'rooftop', 'private room'],
      default: 'indoor'
    },
    status: {
      type: String,
      enum: ['available', 'occupied', 'reserved', 'maintenance'],
      default: 'available'
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

// Indexes
tableSchema.index({ branchId: 1, tableNumber: 1 }, { unique: true });
tableSchema.index({ qrCode: 1 }, { unique: true });

export const Table = mongoose.model<ITable>('Table', tableSchema);