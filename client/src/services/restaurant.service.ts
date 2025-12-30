import apiClient from '../lib/api';
import type { Restaurant, Branch, Table, Tax } from '../types/restaurant.types';
import type { ApiResponse } from '../types/api.types';

export const restaurantService = {
  // Get restaurant by ID
  getRestaurantById: async (restaurantId: string): Promise<Restaurant> => {
    const response = await apiClient.get<ApiResponse<Restaurant>>(`/restaurants/${restaurantId}`);
    return response.data.data;
  },

  // Get restaurant by slug
  getRestaurantBySlug: async (slug: string): Promise<Restaurant> => {
    const response = await apiClient.get<ApiResponse<Restaurant>>(`/public/restaurant/${slug}`);
    return response.data.data;
  },

  // Update restaurant
  updateRestaurant: async (
    restaurantId: string,
    data: Partial<Restaurant>
  ): Promise<Restaurant> => {
    const response = await apiClient.patch<ApiResponse<Restaurant>>(
      `/restaurants/${restaurantId}`,
      data
    );
    return response.data.data;
  },
};

export const branchService = {
  // Get branches
  getBranches: async (restaurantId: string): Promise<Branch[]> => {
    const response = await apiClient.get<ApiResponse<Branch[]>>(`/${restaurantId}/branches`);
    return response.data.data;
  },

  // Create branch
  createBranch: async (restaurantId: string, data: Partial<Branch>): Promise<Branch> => {
    const response = await apiClient.post<ApiResponse<Branch>>(`/${restaurantId}/branches`, data);
    return response.data.data;
  },

  // Update branch
  updateBranch: async (
    restaurantId: string,
    branchId: string,
    data: Partial<Branch>
  ): Promise<Branch> => {
    const response = await apiClient.patch<ApiResponse<Branch>>(
      `/${restaurantId}/branches/${branchId}`,
      data
    );
    return response.data.data;
  },
};

export const tableService = {
  // Get tables
  getTables: async (restaurantId: string): Promise<Table[]> => {
    const response = await apiClient.get<ApiResponse<Table[]>>(
      `/restaurants/${restaurantId}/tables`
    );
    return response.data.data;
  },

  // Create table
  createTable: async (restaurantId: string, data: Partial<Table>): Promise<Table> => {
    const response = await apiClient.post<ApiResponse<Table>>(
      `/restaurants/${restaurantId}/tables`,
      data
    );
    return response.data.data;
  },

  // Update table
  updateTable: async (
    restaurantId: string,
    tableId: string,
    data: Partial<Table>
  ): Promise<Table> => {
    const response = await apiClient.patch<ApiResponse<Table>>(
      `/restaurants/${restaurantId}/tables/${tableId}`,
      data
    );
    return response.data.data;
  },

  // Delete table
  deleteTable: async (restaurantId: string, tableId: string): Promise<void> => {
    await apiClient.delete(`/restaurants/${restaurantId}/tables/${tableId}`);
  },
};

export const taxService = {
  // Get taxes
  getTaxes: async (restaurantId: string): Promise<Tax[]> => {
    const response = await apiClient.get<ApiResponse<Tax[]>>(`/restaurants/${restaurantId}/taxes`);
    return response.data.data;
  },

  // Create tax
  createTax: async (restaurantId: string, data: Partial<Tax>): Promise<Tax> => {
    const response = await apiClient.post<ApiResponse<Tax>>(
      `/restaurants/${restaurantId}/taxes`,
      data
    );
    return response.data.data;
  },

  // Update tax
  updateTax: async (restaurantId: string, taxId: string, data: Partial<Tax>): Promise<Tax> => {
    const response = await apiClient.patch<ApiResponse<Tax>>(
      `/restaurants/${restaurantId}/taxes/${taxId}`,
      data
    );
    return response.data.data;
  },

  // Delete tax
  deleteTax: async (restaurantId: string, taxId: string): Promise<void> => {
    await apiClient.delete(`/restaurants/${restaurantId}/taxes/${taxId}`);
  },
};
