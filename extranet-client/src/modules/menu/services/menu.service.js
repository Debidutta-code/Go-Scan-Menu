// src/services/menu.service.ts
import env from '@/shared/config/env';
export class MenuService {
    static getHeaders(token) {
        const headers = {
            'Content-Type': 'application/json',
        };
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        return headers;
    }
    static async request(endpoint, options = {}, token) {
        try {
            const response = await fetch(`${env.API_BASE_URL}${endpoint}`, {
                ...options,
                headers: this.getHeaders(token),
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Request failed');
            }
            return data;
        }
        catch (error) {
            throw error instanceof Error ? error : new Error('Network error');
        }
    }
    static getRestaurantId(restaurantId) {
        if (!restaurantId)
            return '';
        if (typeof restaurantId === 'string')
            return restaurantId;
        return restaurantId._id || restaurantId.id || '';
    }
    // Category APIs
    static async getCategories(token, restaurantId) {
        const rId = this.getRestaurantId(restaurantId);
        return this.request(`/restaurants/${rId}/categories`, {}, token);
    }
    static async getCategory(token, restaurantId, categoryId) {
        const rId = this.getRestaurantId(restaurantId);
        return this.request(`/restaurants/${rId}/categories/${categoryId}`, {}, token);
    }
    static async createCategory(token, restaurantId, payload) {
        const rId = this.getRestaurantId(restaurantId);
        return this.request(`/restaurants/${rId}/categories`, {
            method: 'POST',
            body: JSON.stringify(payload),
        }, token);
    }
    static async updateCategory(token, restaurantId, categoryId, payload) {
        const rId = this.getRestaurantId(restaurantId);
        return this.request(`/restaurants/${rId}/categories/${categoryId}`, {
            method: 'PUT',
            body: JSON.stringify(payload),
        }, token);
    }
    /**
     * Get category count for auto-incrementing display order
     * Uses public endpoint (no auth required)
     */
    static async getCategoryCount(token, restaurantId, scope = 'restaurant') {
        const rId = this.getRestaurantId(restaurantId);
        return this.request(`/categories/public/${rId}/count?scope=${scope}`, {}, null // No token needed for public endpoint
        );
    }
    // Menu Item APIs
    static async getMenuItems(token, restaurantId, page = 1, limit = 50) {
        const rId = this.getRestaurantId(restaurantId);
        return this.request(`/restaurants/${rId}/menu-items?page=${page}&limit=${limit}`, {}, token);
    }
    static async getMenuItem(token, restaurantId, menuItemId) {
        const rId = this.getRestaurantId(restaurantId);
        return this.request(`/restaurants/${rId}/menu-items/${menuItemId}`, {}, token);
    }
    static async getMenuItemsByCategory(token, restaurantId, categoryId, page = 1, limit = 50) {
        const rId = this.getRestaurantId(restaurantId);
        return this.request(`/restaurants/${rId}/menu-items/category/${categoryId}?page=${page}&limit=${limit}`, {}, token);
    }
    static async createMenuItem(token, restaurantId, payload) {
        const rId = this.getRestaurantId(restaurantId);
        return this.request(`/restaurants/${rId}/menu-items`, {
            method: 'POST',
            body: JSON.stringify(payload),
        }, token);
    }
    static async updateMenuItem(token, restaurantId, menuItemId, payload) {
        const rId = this.getRestaurantId(restaurantId);
        return this.request(`/restaurants/${rId}/menu-items/${menuItemId}`, {
            method: 'PUT',
            body: JSON.stringify(payload),
        }, token);
    }
    static async updateAvailability(token, restaurantId, menuItemId, isAvailable) {
        const rId = this.getRestaurantId(restaurantId);
        return this.request(`/restaurants/${rId}/menu-items/${menuItemId}/availability`, {
            method: 'PATCH',
            body: JSON.stringify({ isAvailable }),
        }, token);
    }
    static async deleteMenuItem(token, restaurantId, menuItemId) {
        const rId = this.getRestaurantId(restaurantId);
        return this.request(`/restaurants/${rId}/menu-items/${menuItemId}`, {
            method: 'DELETE',
        }, token);
    }
    static async updateCategoryDisplayOrder(token, restaurantId, categoryId, displayOrder) {
        const rId = this.getRestaurantId(restaurantId);
        return this.request(`/restaurants/${rId}/categories/${categoryId}/display-order`, {
            method: 'PATCH',
            body: JSON.stringify({ displayOrder }),
        }, token);
    }
}
