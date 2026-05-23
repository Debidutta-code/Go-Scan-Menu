export interface MenuItem {
  id: string;
  _id: string;
  name: string;
  description: string;
  image?: string;
  images?: string[];
  price: number;
  discountPrice?: number;
  preparationTime?: number;
  calories?: number;
  spiceLevel?: string;
  tags?: string[];
  isAvailable: boolean;
  dietaryType?: 'VEG' | 'NON_VEG' | 'EGG' | 'JAIN' | 'VEGAN' | 'GLUTEN_FREE';
}

export interface Category {
  id: string;
  _id: string;
  name: string;
  description: string;
  image?: string;
  displayOrder: number;
  items: MenuItem[];
}

export interface RestaurantTheme {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  font: string;
}

export interface Restaurant {
  id: string;
  _id: string;
  name: string;
  slug: string;
  theme?: RestaurantTheme;
  logo?: string;
  currency?: string;
}

export interface MenuData {
  restaurant: Restaurant;
  menu: Category[];
}

export interface MenuResponse {
  success: boolean;
  message: string;
  data: MenuData;
}
