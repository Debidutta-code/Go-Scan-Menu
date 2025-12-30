// Restaurant & Branch Types
export interface RestaurantOwner {
  name: string;
  email: string;
  phone: string;
}

export interface RestaurantSubscription {
  plan: 'trial' | 'basic' | 'premium' | 'enterprise';
  startDate: string;
  endDate: string;
  isActive: boolean;
  maxBranches: number;
  currentBranches: number;
}

export interface RestaurantTheme {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  logo?: string;
  favicon?: string;
  font: string;
  bannerImage?: string;
  customCSS?: string;
}

export interface RestaurantSettings {
  currency: string;
  defaultTaxIds: string[];
  serviceChargePercentage: number;
  allowBranchOverride: boolean;
}

export interface MenuSettings {
  centralizedMenu: boolean;
  allowBranchSpecificItems: boolean;
}

export interface Restaurant {
  _id: string;
  name: string;
  slug: string;
  type: 'single' | 'chain';
  ownerId?: string;
  owner: RestaurantOwner;
  subscription: RestaurantSubscription;
  theme: RestaurantTheme;
  defaultSettings: RestaurantSettings;
  menuSettings: MenuSettings;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BranchAddress {
  street: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  latitude?: number;
  longitude?: number;
}

export interface BranchContact {
  phone: string;
  email?: string;
  website?: string;
}

export interface BranchOperatingHours {
  day: string;
  openTime: string;
  closeTime: string;
  isClosed: boolean;
}

export interface BranchSettings {
  currency?: string;
  taxIds?: string[];
  serviceChargePercentage?: number;
}

export interface Branch {
  _id: string;
  restaurantId: string;
  name: string;
  code: string;
  address: BranchAddress;
  contact: BranchContact;
  operatingHours: BranchOperatingHours[];
  settings: BranchSettings;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Table {
  _id: string;
  restaurantId: string;
  branchId: string;
  tableNumber: string;
  qrCode: string;
  capacity: number;
  location: 'indoor' | 'outdoor' | 'balcony' | 'rooftop' | 'private room';
  status: 'available' | 'occupied' | 'reserved' | 'maintenance';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Tax {
  _id: string;
  restaurantId: string;
  branchId?: string;
  name: string;
  description?: string;
  taxType: 'percentage' | 'fixed';
  value: number;
  applicableOn: 'subtotal' | 'item_total' | 'after_other_taxes';
  category: 'food_tax' | 'service_tax' | 'room_tax' | 'luxury_tax' | 'other';
  groupName?: string;
  displayOrder: number;
  isActive: boolean;
  scope: 'restaurant' | 'branch';
  createdAt: string;
  updatedAt: string;
}
