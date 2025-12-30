import apiClient from '../lib/api';
export const menuService = {
    // Get menu by QR code
    getMenuByQrCode: async (restaurantSlug, branchCode, qrCode) => {
        const response = await apiClient.get(`/public/menu/${restaurantSlug}/${branchCode}/${qrCode}`);
        return response.data.data;
    },
    // Get menu by branch
    getMenuByBranch: async (restaurantSlug, branchCode) => {
        const response = await apiClient.get(`/public/menu/${restaurantSlug}/${branchCode}`);
        return response.data.data;
    },
    // Get categories
    getCategories: async (restaurantId) => {
        const response = await apiClient.get(`/restaurants/${restaurantId}/categories`);
        return response.data.data;
    },
    // Create category
    createCategory: async (restaurantId, data) => {
        const response = await apiClient.post(`/restaurants/${restaurantId}/categories`, data);
        return response.data.data;
    },
    // Update category
    updateCategory: async (restaurantId, categoryId, data) => {
        const response = await apiClient.patch(`/restaurants/${restaurantId}/categories/${categoryId}`, data);
        return response.data.data;
    },
    // Delete category
    deleteCategory: async (restaurantId, categoryId) => {
        await apiClient.delete(`/restaurants/${restaurantId}/categories/${categoryId}`);
    },
    // Get menu items
    getMenuItems: async (restaurantId) => {
        const response = await apiClient.get(`/restaurants/${restaurantId}/menu-items`);
        return response.data.data;
    },
    // Create menu item
    createMenuItem: async (restaurantId, data) => {
        const response = await apiClient.post(`/restaurants/${restaurantId}/menu-items`, data);
        return response.data.data;
    },
    // Update menu item
    updateMenuItem: async (restaurantId, itemId, data) => {
        const response = await apiClient.patch(`/restaurants/${restaurantId}/menu-items/${itemId}`, data);
        return response.data.data;
    },
    // Delete menu item
    deleteMenuItem: async (restaurantId, itemId) => {
        await apiClient.delete(`/restaurants/${restaurantId}/menu-items/${itemId}`);
    },
};
