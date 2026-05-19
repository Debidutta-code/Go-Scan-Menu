// src/shared/types/tax.types.ts

export interface ITax {
  _id: string;
  restaurantId: string;
  branchId?: string;
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
    specificItems?: any[];
    specificCategories?: any[];
  };
  isPartOfGroup?: boolean;
  groupName?: string;
  isActive: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
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

export interface TaxListResponse {
  taxes: ITax[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
