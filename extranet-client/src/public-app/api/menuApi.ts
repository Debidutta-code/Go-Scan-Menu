import axiosInstance from '@/shared/services/axios.service';
import { MenuResponse } from '@/public-app/types/menu.types';

export const menuApi = {
  getMenu: async (restaurantSlug: string): Promise<MenuResponse> => {
    const response = await axiosInstance.get(`/public/menu/${restaurantSlug}`);
    return response.data;
  },
};