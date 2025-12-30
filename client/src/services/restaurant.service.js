import apiClient from '../lib/api';
export const restaurantService = {
    // Get restaurant by ID
    getRestaurantById: async (restaurantId) => {
        const response = await apiClient.get(`/restaurants/${restaurantId}`);
        return response.data.data;
    },
    // Get restaurant by slug
    getRestaurantBySlug: async (slug) => {
        const response = await apiClient.get(`/public/restaurant/${slug}`);
        return response.data.data;
    },
    // Update restaurant
    updateRestaurant: async (restaurantId, data) => {
        const response = await apiClient.patch(`/restaurants/${restaurantId}`, data);
        return response.data.data;
    },
};
export const branchService = {
    // Get branches
    getBranches: async (restaurantId) => {
        const response = await apiClient.get(`/${restaurantId}/branches`);
        return response.data.data;
    },
    // Create branch
    createBranch: async (restaurantId, data) => {
        const response = await apiClient.post(`/${restaurantId}/branches`, data);
        return response.data.data;
    },
    // Update branch
    updateBranch: async (restaurantId, branchId, data) => {
        const response = await apiClient.patch(`/${restaurantId}/branches/${branchId}`, data);
        return response.data.data;
    },
};
export const tableService = {
    // Get tables
    getTables: async (restaurantId) => {
        const response = await apiClient.get(`/restaurants/${restaurantId}/tables`);
        return response.data.data;
    },
    // Create table
    createTable: async (restaurantId, data) => {
        const response = await apiClient.post(`/restaurants/${restaurantId}/tables`, data);
        return response.data.data;
    },
    // Update table
    updateTable: async (restaurantId, tableId, data) => {
        const response = await apiClient.patch(`/restaurants/${restaurantId}/tables/${tableId}`, data);
        return response.data.data;
    },
    // Delete table
    deleteTable: async (restaurantId, tableId) => {
        await apiClient.delete(`/restaurants/${restaurantId}/tables/${tableId}`);
    },
};
export const taxService = {
    // Get taxes
    getTaxes: async (restaurantId) => {
        const response = await apiClient.get(`/restaurants/${restaurantId}/taxes`);
        return response.data.data;
    },
    // Create tax
    createTax: async (restaurantId, data) => {
        const response = await apiClient.post(`/restaurants/${restaurantId}/taxes`, data);
        return response.data.data;
    },
    // Update tax
    updateTax: async (restaurantId, taxId, data) => {
        const response = await apiClient.patch(`/restaurants/${restaurantId}/taxes/${taxId}`, data);
        return response.data.data;
    },
    // Delete tax
    deleteTax: async (restaurantId, taxId) => {
        await apiClient.delete(`/restaurants/${restaurantId}/taxes/${taxId}`);
    },
};
