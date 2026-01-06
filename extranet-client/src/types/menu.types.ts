// src/types/menu.types.ts

export interface MenuItem {
  _id: string;
  restaurantId: string;
  branchId?: string;
  categoryId: string;
  name: string;
  description?: string;
  image?: string;
  images: string[];
  price: number;
  discountPrice?: number;
  scope: 'restaurant' | 'branch';
  branchPricing: Array<{
    branchId: string;
    price: number;
    discountPrice?: number;
    isAvailable: boolean;
  }>;
  preparationTime?: number;
  calories?: number;
  spiceLevel?: 'mild' | 'medium' | 'hot' | 'extra_hot';
  tags: string[];
  allergens: string[];
  variants: Array<{
    name: string;
    price: number;
    isDefault: boolean;
  }>;
  addons: Array<{
    name: string;
    price: number;
  }>;
  customizations: Array<{
    name: string;
    options: string[];
    isRequired: boolean;
  }>;
  isAvailable: boolean;
  availableQuantity?: number;
  isActive: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  _id: string;
  restaurantId: string;
  branchId?: string;
  name: string;
  description?: string;
  image?: string;
  displayOrder: number;
  scope: 'restaurant' | 'branch';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMenuItemPayload {
  categoryId: string;
  name: string;
  description?: string;
  image?: string;
  images?: string[];
  price: number;
  discountPrice?: number;
  scope?: 'restaurant' | 'branch';
  branchId?: string;
  preparationTime?: number;
  calories?: number;
  spiceLevel?: 'mild' | 'medium' | 'hot' | 'extra_hot';
  tags?: string[];
  allergens?: string[];
  variants?: Array<{
    name: string;
    price: number;
    isDefault: boolean;
  }>;
  addons?: Array<{
    name: string;
    price: number;
  }>;
  customizations?: Array<{
    name: string;
    options: string[];
    isRequired: boolean;
  }>;
  isAvailable?: boolean;
  availableQuantity?: number;
  isActive?: boolean;
  displayOrder?: number;
}

export interface CreateCategoryPayload {
  name: string;
  description?: string;
  image?: string;
  displayOrder?: number;
  scope?: 'restaurant' | 'branch';
  branchId?: string;
  isActive?: boolean;
}

export interface MenuItemListResponse {
  menuItems: MenuItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CategoryListResponse {
  categories: Category[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
