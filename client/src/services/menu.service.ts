import { apiService } from './api.service';
import { API_ENDPOINTS } from '@/config/api.config';

class MenuService {
  async getPublicMenu(restaurantSlug: string, branchCode: string) {
    return await apiService.get(
      API_ENDPOINTS.PUBLIC.MENU(restaurantSlug, branchCode)
    );
  }

  async getTableByQR(qrCode: string) {
    return await apiService.get(API_ENDPOINTS.PUBLIC.TABLE(qrCode));
  }

  async getCategories(restaurantId: string) {
    return await apiService.get(API_ENDPOINTS.CATEGORIES(restaurantId));
  }

  async getMenuItems(restaurantId: string, params?: any) {
    return await apiService.get(API_ENDPOINTS.MENU_ITEMS(restaurantId), params);
  }

  async createCategory(restaurantId: string, data: any) {
    return await apiService.post(API_ENDPOINTS.CATEGORIES(restaurantId), data);
  }

  async updateCategory(restaurantId: string, categoryId: string, data: any) {
    return await apiService.put(
      `${API_ENDPOINTS.CATEGORIES(restaurantId)}/${categoryId}`,
      data
    );
  }

  async deleteCategory(restaurantId: string, categoryId: string) {
    return await apiService.delete(
      `${API_ENDPOINTS.CATEGORIES(restaurantId)}/${categoryId}`
    );
  }

  async createMenuItem(restaurantId: string, data: any) {
    return await apiService.post(API_ENDPOINTS.MENU_ITEMS(restaurantId), data);
  }

  async updateMenuItem(restaurantId: string, itemId: string, data: any) {
    return await apiService.put(
      `${API_ENDPOINTS.MENU_ITEMS(restaurantId)}/${itemId}`,
      data
    );
  }

  async deleteMenuItem(restaurantId: string, itemId: string) {
    return await apiService.delete(
      `${API_ENDPOINTS.MENU_ITEMS(restaurantId)}/${itemId}`
    );
  }

  async updateMenuItemAvailability(
    restaurantId: string,
    itemId: string,
    isAvailable: boolean
  ) {
    return await apiService.patch(
      `${API_ENDPOINTS.MENU_ITEMS(restaurantId)}/${itemId}/availability`,
      { isAvailable }
    );
  }
}

export const menuService = new MenuService();
export default menuService;
