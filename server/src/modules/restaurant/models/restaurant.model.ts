// src/models/Restaurant.model.ts
import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IRestaurant extends Document {
  name: string;
  slug: string;
  type: 'single' | 'chain';
  ownerId?: Types.ObjectId; // Reference to Staff model
  owner: {
    name: string;
    email: string;
    phone: string;
    password: string;
  };
  subscription: {
    plan: 'trial' | 'basic' | 'premium' | 'enterprise';
    startDate: Date;
    endDate: Date;
    isActive: boolean;
    maxBranches: number;
    currentBranches: number;
  };
  theme: {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    logo?: string;
    favicon?: string;
    font: string;
    bannerImage?: string;
    customCSS?: string;
  };
  defaultSettings: {
    currency: string;
    defaultTaxIds: Types.ObjectId[];
    serviceChargePercentage: number;
    allowBranchOverride: boolean;
  };
  menuSettings: {
    centralizedMenu: boolean;
    allowBranchSpecificItems: boolean;
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const restaurantSchema = new Schema<IRestaurant>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ['single', 'chain'],
      required: true,
    },
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: 'Staff',
    },
    owner: {
      name: {
        type: String,
        required: true,
        trim: true,
      },
      email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
      },
      phone: {
        type: String,
        required: true,
        trim: true,
      },
      password: {
        type: String,
        required: true,
      },
    },
    subscription: {
      plan: {
        type: String,
        enum: ['trial', 'basic', 'premium', 'enterprise'],
        default: 'trial',
      },
      startDate: {
        type: Date,
        required: true,
      },
      endDate: {
        type: Date,
        required: true,
      },
      isActive: {
        type: Boolean,
        default: true,
      },
      maxBranches: {
        type: Number,
        required: true,
      },
      currentBranches: {
        type: Number,
        default: 0,
      },
    },
    theme: {
      primaryColor: {
        type: String,
        default: '#3498db',
      },
      secondaryColor: {
        type: String,
        default: '#95a5a6',
      },
      accentColor: {
        type: String,
        default: '#e74c3c',
      },
      logo: String,
      favicon: String,
      font: {
        type: String,
        default: 'Roboto',
      },
      bannerImage: String,
      customCSS: String,
    },
    defaultSettings: {
      currency: {
        type: String,
        default: 'USD',
      },
      defaultTaxIds: [
        {
          type: Schema.Types.ObjectId,
          ref: 'Tax',
        },
      ],
      serviceChargePercentage: {
        type: Number,
        default: 0,
      },
      allowBranchOverride: {
        type: Boolean,
        default: false,
      },
    },
    menuSettings: {
      centralizedMenu: {
        type: Boolean,
        default: true,
      },
      allowBranchSpecificItems: {
        type: Boolean,
        default: false,
      },
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
restaurantSchema.index({ slug: 1 }, { unique: true });
restaurantSchema.index({ 'owner.email': 1 }, { unique: true });
restaurantSchema.index({ ownerId: 1 });

export const Restaurant = mongoose.model<IRestaurant>('Restaurant', restaurantSchema);
