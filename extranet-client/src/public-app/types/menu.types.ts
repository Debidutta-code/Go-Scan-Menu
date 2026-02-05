export interface MenuItem {
  id: string;
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
  allergens?: string[];
  variants?: Variant[];
  addons?: Addon[];
  customizations?: Customization[];
  isAvailable: boolean;
  availableQuantity?: number;
}

export interface Variant {
  name: string;
  price: number;
  isDefault: boolean;
  _id: string;
}

export interface Addon {
  name: string;
  price: number;
  _id: string;
}

export interface Customization {
  name: string;
  options: string[];
  _id: string;
}

export interface Category {
  id: string;
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
  name: string;
  slug: string;
  theme?: RestaurantTheme;
  logo?: string;
}

export interface Address {
  coordinates: {
    latitude: number;
    longitude: number;
  };
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface BranchSettings {
  currency: string;
  minOrderAmount: number;
  deliveryAvailable: boolean;
  takeawayAvailable: boolean;
}

export interface Branch {
  id: string;
  name: string;
  code: string;
  address?: Address;
  phone?: string;
  settings: BranchSettings;
}

export interface Table {
  id: string;
  tableNumber: string;
  capacity: number;
  location: string;
  status: string;
}

export interface MenuData {
  restaurant: Restaurant;
  branch: Branch;
  table?: Table;
  menu: Category[];
}

export interface MenuResponse {
  success: boolean;
  message: string;
  data: MenuData;
}
