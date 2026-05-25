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

export interface CategoryListResponse {
  success: boolean;
  message: string;
  data: CategoryListData;
}

/** Returned by GET /public/menu/:restaurantSlug */
export interface MenuData {
  restaurant: Restaurant;
  menu: Category[];
}

export interface MenuResponse {
  success: boolean;
  message: string;
  data: MenuData;
}
