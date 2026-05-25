import axiosInstance from '@/shared/services/axios.service';
import { CategoryListResponse } from '@/public-app/types/menu.types';

export const categoryApi = {
  getCategories: async (restaurantSlug: string): Promise<CategoryListResponse> => {
    const response = await axiosInstance.get(`/public/categories/${restaurantSlug}`);
    return response.data;
  },
};