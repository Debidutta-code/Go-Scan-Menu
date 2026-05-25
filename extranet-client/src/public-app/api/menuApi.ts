import axiosInstance from '@/shared/services/axios.service';
import {
  MenuResponse,
  PublicInitResponse,
  PublicCategoriesResponse,
  PublicMenuResponse
} from '@/public-app/types/menu.types';

export const menuApi = {
  getInit: async (
    restaurantSlug: string,
    qrCode?: string
  ): Promise<PublicInitResponse> => {
    const endpoint = qrCode
      ? `/public/init/${restaurantSlug}/${qrCode}`
      : `/public/init/${restaurantSlug}`;

    const response = await axiosInstance.get(endpoint);
    return response.data;
  },

  getCategories: async (
    restaurantSlug: string
  ): Promise<PublicCategoriesResponse> => {
    const endpoint = `/public/categories/${restaurantSlug}`;
    const response = await axiosInstance.get(endpoint);
    return response.data;
  },

  getMenu: async (
    restaurantSlug: string
  ): Promise<PublicMenuResponse> => {
    const endpoint = `/public/menu/${restaurantSlug}`;
    const response = await axiosInstance.get(endpoint);
    return response.data;
  },

  // Keep for backward compatibility or if needed
  getLegacyFullMenu: async (
    restaurantSlug: string,
    qrCode?: string
  ): Promise<MenuResponse> => {
    const endpoint = qrCode
      ? `/public/menu/${restaurantSlug}/${qrCode}`
      : `/public/menu/${restaurantSlug}`;

    const response = await axiosInstance.get(endpoint);
    return response.data;
  },
};