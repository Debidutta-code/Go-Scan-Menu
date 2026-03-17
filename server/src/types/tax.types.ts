// src/types/tax.types.ts
import { Types, Document } from 'mongoose';

export interface ITax extends Document {
  restaurantId: Types.ObjectId;
  branchId?: Types.ObjectId;
  name: string;
  description?: string;
  taxType: 'percentage' | 'fixed';
  value: number;
  applicableOn: 'subtotal' | 'item_total' | 'after_other_taxes';
  scope: 'restaurant' | 'branch';
  category: 'food_tax' | 'service_tax' | 'room_tax' | 'luxury_tax' | 'other';
  conditions?: {
    orderType?: ('dine-in' | 'takeaway')[];
    minOrderAmount?: number;
    maxOrderAmount?: number;
    specificItems?: Types.ObjectId[];
    specificCategories?: Types.ObjectId[];
  };
  isPartOfGroup?: boolean;
  groupName?: string;
  isActive: boolean;
  displayOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTaxDTO {
  name: string;
  description?: string;
  taxType: 'percentage' | 'fixed';
  value: number;
  applicableOn: 'subtotal' | 'item_total' | 'after_other_taxes';
  scope: 'restaurant' | 'branch';
  branchId?: string;
  category: 'food_tax' | 'service_tax' | 'room_tax' | 'luxury_tax' | 'other';
  conditions?: {
    orderType?: ('dine-in' | 'takeaway')[];
    minOrderAmount?: number;
    maxOrderAmount?: number;
    specificItems?: string[];
    specificCategories?: string[];
  };
  isPartOfGroup?: boolean;
  groupName?: string;
  displayOrder?: number;
}

export interface UpdateTaxDTO extends Partial<CreateTaxDTO> {}
