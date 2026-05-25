// ─── Lightweight category (used on the grid/landing page) ───────────────────
export interface CategorySummary {
  id: string;
  _id: string;
  name: string;
  image?: string;
  displayOrder: number;
  itemCount: number;
}

// ─── Full category with items (used on the menu-list page) ──────────────────
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

// ─── Restaurant ──────────────────────────────────────────────────────────────
export interface RestaurantTheme {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  font: string;
  logo?: string;
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

// ─── API response shapes ─────────────────────────────────────────────────────

/** Returned by GET /public/categories/:restaurantSlug */
export interface CategoryListData {
  restaurant: Restaurant;
  categories: CategorySummary[];
}

export interface Branch {
  id: string;
  _id: string;
  name: string;
  code: string;
  address?: Address;
  phone?: string;
  settings: BranchSettings;
}

export interface Table {
  id: string;
  _id: string;
  tableNumber: string;
  capacity: number;
  location: string;
  status: string;
}

export interface PublicInitData {
  restaurant: Restaurant;
  table: Table | null;
}

export interface MenuData {
  restaurant: Restaurant;
  menu: Category[];
}

export interface PublicInitResponse {
  success: boolean;
  message: string;
  data: PublicInitData;
}

export interface PublicCategoriesResponse {
  success: boolean;
  message: string;
  data: Category[];
}

export interface PublicMenuResponse {
  success: boolean;
  message: string;
  data: Category[];
}

export interface MenuResponse {
  success: boolean;
  message: string;
  data: MenuData;
}
