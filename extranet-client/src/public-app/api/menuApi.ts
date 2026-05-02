import axiosInstance from '@/shared/services/axios.service';
import { MenuResponse } from '@/public-app/types/menu.types';

export const menuApi = {
  getMenu: async (
    restaurantSlug: string,
    branchCode: string,
    qrCode?: string
  ): Promise<MenuResponse> => {
    const endpoint = qrCode
      ? `/public/menu/${restaurantSlug}/${branchCode}/${qrCode}`
      : `/public/menu/${restaurantSlug}/${branchCode}`;

    const response = await axiosInstance.get(endpoint);
    return response.data;
  },
};
