// src/types/menu.types.ts

// Enums matching backend
export enum DietaryType {
  VEG = 'VEG',
  EGG = 'EGG',
  NON_VEG = 'NON_VEG',
  JAIN = 'JAIN',
  VEGAN = 'VEGAN',
  GLUTEN_FREE = 'GLUTEN_FREE',
}

export enum NutritionTag {
  HIGH_PROTEIN = 'HIGH_PROTEIN',
  LOW_CALORIES = 'LOW_CALORIES',
  LOW_FAT = 'LOW_FAT',
  LOW_SUGAR = 'LOW_SUGAR',
  HIGH_FIBER = 'HIGH_FIBER',
  KETO_FRIENDLY = 'KETO_FRIENDLY',
  LOW_CARB = 'LOW_CARB',
}

export enum Allergen {
  DAIRY = 'DAIRY',
  GLUTEN = 'GLUTEN',
  PEANUTS = 'PEANUTS',
  TREE_NUTS = 'TREE_NUTS',
  EGGS = 'EGGS',
  SOY = 'SOY',
  SESAME = 'SESAME',
  FISH = 'FISH',
  SHELLFISH = 'SHELLFISH',
  MUSTARD = 'MUSTARD',
  ALLIUM = 'ALLIUM',
}

export enum DrinkTemperature {
  HOT = 'HOT',
  COLD = 'COLD',
}

export enum DrinkAlcoholContent {
  ALCOHOLIC = 'ALCOHOLIC',
  NON_ALCOHOLIC = 'NON_ALCOHOLIC',
}

export enum DrinkCaffeineContent {
  CAFFEINATED = 'CAFFEINATED',
  NON_CAFFEINATED = 'NON_CAFFEINATED',
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
  allergens: Allergen[];
  nutritionTags: NutritionTag[];
  itemType: 'food' | 'drink';
  dietaryType?: DietaryType;
  drinkTemperature?: DrinkTemperature;
  drinkAlcoholContent?: DrinkAlcoholContent;
  drinkCaffeineContent?: DrinkCaffeineContent;
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
  allergens?: Allergen[];
  nutritionTags?: NutritionTag[];
  itemType: 'food' | 'drink';
  dietaryType?: DietaryType;
  drinkTemperature?: DrinkTemperature;
  drinkAlcoholContent?: DrinkAlcoholContent;
  drinkCaffeineContent?: DrinkCaffeineContent;
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
  items: MenuItem[];
  totalPages: number;
}

export interface CategoryListResponse {
  categories: Category[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CategoryCountResponse {
  count: number;
}

// Helper type for displaying allergen labels
export const AllergenLabels: Record<Allergen, string> = {
  [Allergen.DAIRY]: 'Dairy',
  [Allergen.GLUTEN]: 'Gluten',
  [Allergen.PEANUTS]: 'Peanuts',
  [Allergen.TREE_NUTS]: 'Tree Nuts',
  [Allergen.EGGS]: 'Eggs',
  [Allergen.SOY]: 'Soy',
  [Allergen.SESAME]: 'Sesame',
  [Allergen.FISH]: 'Fish',
  [Allergen.SHELLFISH]: 'Shellfish',
  [Allergen.MUSTARD]: 'Mustard',
  [Allergen.ALLIUM]: 'Allium (Onion/Garlic)',
};

// Helper type for displaying nutrition tag labels
export const NutritionTagLabels: Record<NutritionTag, string> = {
  [NutritionTag.HIGH_PROTEIN]: 'High Protein',
  [NutritionTag.LOW_CALORIES]: 'Low Calories',
  [NutritionTag.LOW_FAT]: 'Low Fat',
  [NutritionTag.LOW_SUGAR]: 'Low Sugar',
  [NutritionTag.HIGH_FIBER]: 'High Fiber',
  [NutritionTag.KETO_FRIENDLY]: 'Keto Friendly',
  [NutritionTag.LOW_CARB]: 'Low Carb',
};

// Helper type for displaying dietary type labels
export const DietaryTypeLabels: Record<DietaryType, string> = {
  [DietaryType.VEG]: 'Vegetarian',
  [DietaryType.EGG]: 'Eggitarian',
  [DietaryType.NON_VEG]: 'Non-Vegetarian',
  [DietaryType.JAIN]: 'Jain',
  [DietaryType.VEGAN]: 'Vegan',
  [DietaryType.GLUTEN_FREE]: 'Gluten Free',
};

// Helper type for displaying drink temperature labels
export const DrinkTemperatureLabels: Record<DrinkTemperature, string> = {
  [DrinkTemperature.HOT]: 'Hot',
  [DrinkTemperature.COLD]: 'Cold',
};

// Helper type for displaying alcohol content labels
export const DrinkAlcoholContentLabels: Record<DrinkAlcoholContent, string> = {
  [DrinkAlcoholContent.ALCOHOLIC]: 'Alcoholic',
  [DrinkAlcoholContent.NON_ALCOHOLIC]: 'Non-Alcoholic',
};

// Helper type for displaying caffeine content labels
export const DrinkCaffeineContentLabels: Record<DrinkCaffeineContent, string> = {
  [DrinkCaffeineContent.CAFFEINATED]: 'Caffeinated',
  [DrinkCaffeineContent.NON_CAFFEINATED]: 'Non-Caffeinated',
};

// Helper type for dietary type icons/emojis
export const DietaryTypeIcons: Record<DietaryType, string> = {
  [DietaryType.VEG]: '🟢',
  [DietaryType.EGG]: '🟡',
  [DietaryType.NON_VEG]: '🔴',
  [DietaryType.JAIN]: '🟣',
  [DietaryType.VEGAN]: '🌱',
  [DietaryType.GLUTEN_FREE]: '🌾',
};

// Utility function to format enum values to readable strings
export const formatEnumValue = (value: string): string => {
  return value
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};