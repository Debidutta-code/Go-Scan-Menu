// src/models/Branch.model.ts
import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IBranch extends Document {
  restaurantId: Types.ObjectId;
  name: string;
  code: string;
  email: string;
  phone: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    coordinates: {
      latitude: number;
      longitude: number;
    };
  };
  manager?: {
    staffId: Types.ObjectId;
    name: string;
    email: string;
    phone: string;
  };
  settings: {
    currency: string;
    taxPercentage: number;
    serviceChargePercentage: number;
    acceptOrders: boolean;
    operatingHours: Array<{
      day: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
      isOpen: boolean;
      openTime: string;
      closeTime: string;
    }>;
    minOrderAmount: number;
    deliveryAvailable: boolean;
    takeawayAvailable: boolean;
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const branchSchema = new Schema<IBranch>(
  {
    restaurantId: {
      type: Schema.Types.ObjectId,
      ref: 'Restaurant',
      required: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    code: {
      type: String,
      required: true,
      trim: true,
      uppercase: true
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true
    },
    phone: {
      type: String,
      required: true,
      trim: true
    },
    address: {
      street: {
        type: String,
        required: true,
        trim: true
      },
      city: {
        type: String,
        required: true,
        trim: true
      },
      state: {
        type: String,
        required: true,
        trim: true
      },
      zipCode: {
        type: String,
        required: true,
        trim: true
      },
      country: {
        type: String,
        required: true,
        trim: true
      },
      coordinates: {
        latitude: {
          type: Number,
          required: true
        },
        longitude: {
          type: Number,
          required: true
        }
      }
    },
    manager: {
      staffId: {
        type: Schema.Types.ObjectId,
        ref: 'Staff'
      },
      name: String,
      email: String,
      phone: String
    },
    settings: {
      currency: {
        type: String,
        default: 'USD'
      },
      taxPercentage: {
        type: Number,
        default: 0
      },
      serviceChargePercentage: {
        type: Number,
        default: 0
      },
      acceptOrders: {
        type: Boolean,
        default: true
      },
      operatingHours: [
        {
          day: {
            type: String,
            enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
            required: true
          },
          isOpen: {
            type: Boolean,
            default: true
          },
          openTime: {
            type: String,
            default: '09:00'
          },
          closeTime: {
            type: String,
            default: '22:00'
          }
        }
      ],
      minOrderAmount: {
        type: Number,
        default: 0
      },
      deliveryAvailable: {
        type: Boolean,
        default: false
      },
      takeawayAvailable: {
        type: Boolean,
        default: true
      }
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
branchSchema.index({ restaurantId: 1, isActive: 1 });
branchSchema.index({ restaurantId: 1, code: 1 }, { unique: true });

export const Branch = mongoose.model<IBranch>('Branch', branchSchema);