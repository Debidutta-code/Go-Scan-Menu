import { MenuService } from '@/modules/menu/services/menu.service';
export class MenuAPI {
    static async getCategories(token, restaurantId) {
        const response = await MenuService.getCategories(token, restaurantId);
        if (response.success && response.data) {
            return response.data.categories || [];
        }
        return [];
    }
    static async getMenuItems(token, restaurantId) {
        const response = await MenuService.getMenuItems(token, restaurantId);
        if (response.success && response.data) {
            return response.data.items || [];
        }
        return [];
    }
    static async getMenuItem(token, restaurantId, itemId) {
        const response = await MenuService.getMenuItem(token, restaurantId, itemId);
        if (response.success && response.data) {
            return response.data;
        }
        return null;
    }
    static async createMenuItem(token, restaurantId, payload) {
        return await MenuService.createMenuItem(token, restaurantId, payload);
    }
    static async updateMenuItem(token, restaurantId, itemId, payload) {
        return await MenuService.updateMenuItem(token, restaurantId, itemId, payload);
    }
    static async deleteMenuItem(token, restaurantId, itemId) {
        return await MenuService.deleteMenuItem(token, restaurantId, itemId);
    }
    static async updateAvailability(token, restaurantId, itemId, isAvailable) {
        return await MenuService.updateAvailability(token, restaurantId, itemId, isAvailable);
    }
}
