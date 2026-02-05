import { MenuResponse } from '../types/menu.types';

const API_BASE_URL = 'http://localhost:8080';

export const menuApi = {
  getMenu: async (
    restaurantSlug: string,
    branchCode: string,
    qrCode?: string
  ): Promise<MenuResponse> => {
    try {
      const endpoint = qrCode
        ? `/api/v1/public/menu/${restaurantSlug}/${branchCode}/${qrCode}`
        : `/api/v1/public/menu/${restaurantSlug}/${branchCode}`;

      const response = await fetch(`${API_BASE_URL}${endpoint}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to load menu');
      }

      return data;
    } catch (error) {
      throw error;
    }
  },
};
