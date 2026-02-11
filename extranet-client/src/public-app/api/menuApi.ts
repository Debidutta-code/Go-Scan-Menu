import env from '@/config/env';
import { MenuResponse } from '../types/menu.types';

export const menuApi = {
  getMenu: async (
    restaurantSlug: string,
    branchCode: string,
    qrCode?: string
  ): Promise<MenuResponse> => {
    try {
      const endpoint = qrCode
        ? `/public/menu/${restaurantSlug}/${branchCode}/${qrCode}`
        : `/public/menu/${restaurantSlug}/${branchCode}`;

      const response = await fetch(`${env.API_BASE_URL}${endpoint}`);
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
