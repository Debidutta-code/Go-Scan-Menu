import { MenuService } from '../services/menu.service';

export class MenuAPI {
  static async getCategories(token: string, restaurantId: string) {
    const response = await MenuService.getCategories(token, restaurantId);
    if (response.success && response.data) {
      return response.data.categories || [];
    }
    return [];
  }

  static async getMenuItems(token: string, restaurantId: string) {
    const response = await MenuService.getMenuItems(token, restaurantId);
    if (response.success && response.data) {
      return response.data.items || [];
    }
    return [];
  }

  static async getMenuItem(token: string, restaurantId: string, itemId: string) {
    const response = await MenuService.getMenuItem(token, restaurantId, itemId);
    if (response.success && response.data) {
      return response.data;
    }
    return null;
  }

  static async createMenuItem(token: string, restaurantId: string, payload: any) {
    return await MenuService.createMenuItem(token, restaurantId, payload);
  }

  static async updateMenuItem(token: string, restaurantId: string, itemId: string, payload: any) {
    return await MenuService.updateMenuItem(token, restaurantId, itemId, payload);
  }

  static async deleteMenuItem(token: string, restaurantId: string, itemId: string) {
    return await MenuService.deleteMenuItem(token, restaurantId, itemId);
  }

  static async updateAvailability(
    token: string,
    restaurantId: string,
    itemId: string,
    isAvailable: boolean
  ) {
    return await MenuService.updateAvailability(token, restaurantId, itemId, isAvailable);
  }
}