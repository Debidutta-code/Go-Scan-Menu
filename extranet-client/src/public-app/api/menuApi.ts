import axiosInstance from '@/shared/services/axios.service';
import { MenuResponse } from '@/public-app/types/menu.types';

export const menuApi = {
  getMenu: async (
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
