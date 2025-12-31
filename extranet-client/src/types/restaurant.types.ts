// src/types/restaurant.types.ts

export interface Restaurant {
  _id: string;
  name: string;
  slug: string;
  type: 'single' | 'chain';
  owner: {
    name: string;
    email: string;
    phone: string;
  };
  subscription: {
    plan: 'trial' | 'basic' | 'premium' | 'enterprise';
    startDate: string;
    endDate: string;
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
    defaultTaxIds: string[];
    serviceChargePercentage: number;
    allowBranchOverride: boolean;
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRestaurantDto {
  name: string;
  slug: string;
  type: 'single' | 'chain';
  owner: {
    name: string;
    email: string;
    phone: string;
    password: string;
  };
  subscription?: {
    plan: 'trial' | 'basic' | 'premium' | 'enterprise';
    maxBranches: number;
  };
  theme?: {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    font: string;
  };
  defaultSettings?: {
    currency: string;
    serviceChargePercentage: number;
  };
}

export interface RestaurantFilters {
  search?: string;
  type?: 'single' | 'chain' | '';
  plan?: 'trial' | 'basic' | 'premium' | 'enterprise' | '';
  isActive?: boolean | '';
}

export interface PaginatedResponse<T> {
  restaurants: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}