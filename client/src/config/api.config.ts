export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1',
  SOCKET_URL: import.meta.env.VITE_SOCKET_URL || 'http://localhost:8080',
  TIMEOUT: 30000,
};

export const API_ENDPOINTS = {
  // Auth
  AUTH: {
    LOGIN: '/staff/login',
    REGISTER: '/staff/register',
    ME: '/staff/me',
  },
  // SuperAdmin
  SUPERADMIN: {
    LOGIN: '/superadmin/auth/login',
    REGISTER: '/superadmin/auth/register',
  },
  // Restaurant
  RESTAURANTS: '/restaurants',
  // Branches
  BRANCHES: (restaurantId: string) => `/restaurants/${restaurantId}/branches`,
  // Categories
  CATEGORIES: (restaurantId: string) => `/restaurants/${restaurantId}/categories`,
  // Menu Items
  MENU_ITEMS: (restaurantId: string) => `/restaurants/${restaurantId}/menu-items`,
  // Tables
  TABLES: (restaurantId: string) => `/restaurants/${restaurantId}/tables`,
  // Orders
  ORDERS: (restaurantId: string) => `/restaurants/${restaurantId}/orders`,
  // Public Menu
  PUBLIC: {
    MENU: (restaurantSlug: string, branchCode: string) => `/public/menu/${restaurantSlug}/${branchCode}`,
    TABLE: (qrCode: string) => `/public/table/${qrCode}`,
    ORDER: '/public/order',
  },
  // Taxes
  TAXES: (restaurantId: string) => `/restaurants/${restaurantId}/taxes`,
};
