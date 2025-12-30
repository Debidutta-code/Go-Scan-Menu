// Menu Types
export interface MenuItemVariant {
  name: string;
  price: number;
  isDefault: boolean;
}

export interface MenuItemAddon {
  name: string;
  price: number;
}

export interface MenuItemCustomization {
  name: string;
  options: string[];
  isRequired: boolean;
}

export interface BranchPricing {
  branchId: string;
  price: number;
  discountPrice?: number;
  isAvailable: boolean;
}

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
  branchPricing: BranchPricing[];
  preparationTime?: number;
  calories?: number;
  spiceLevel?: 'mild' | 'medium' | 'hot' | 'extra_hot';
  tags: string[];
  allergens: string[];
  variants: MenuItemVariant[];
  addons: MenuItemAddon[];
  customizations: MenuItemCustomization[];
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
  scope: 'restaurant' | 'branch';
  isActive: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryWithItems extends Category {
  items: MenuItem[];
}

export interface CreateMenuItemRequest {
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
  variants?: MenuItemVariant[];
  addons?: MenuItemAddon[];
  customizations?: MenuItemCustomization[];
  isAvailable?: boolean;
  availableQuantity?: number;
}

export interface UpdateMenuItemRequest extends Partial<CreateMenuItemRequest> {}
