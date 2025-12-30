import apiClient from '../lib/api';
import type { MenuItem, Category, CreateMenuItemRequest } from '../types/menu.types';
import type { ApiResponse } from '../types/api.types';

export const menuService = {
  // Get menu by QR code
  getMenuByQrCode: async (
    restaurantSlug: string,
    branchCode: string,
    qrCode: string
  ): Promise<any> => {
    const response = await apiClient.get<ApiResponse<any>>(
      `/public/menu/${restaurantSlug}/${branchCode}/${qrCode}`
    );
    return response.data.data;
  },

  // Get menu by branch
  getMenuByBranch: async (restaurantSlug: string, branchCode: string): Promise<any> => {
    const response = await apiClient.get<ApiResponse<any>>(
      `/public/menu/${restaurantSlug}/${branchCode}`
    );
    return response.data.data;
  },

  // Get categories
  getCategories: async (restaurantId: string): Promise<Category[]> => {
    const response = await apiClient.get<ApiResponse<Category[]>>(
      `/restaurants/${restaurantId}/categories`
    );
    return response.data.data;
  },

  // Create category
  createCategory: async (restaurantId: string, data: Partial<Category>): Promise<Category> => {
    const response = await apiClient.post<ApiResponse<Category>>(
      `/restaurants/${restaurantId}/categories`,
      data
    );
    return response.data.data;
  },

  // Update category
  updateCategory: async (
    restaurantId: string,
    categoryId: string,
    data: Partial<Category>
  ): Promise<Category> => {
    const response = await apiClient.patch<ApiResponse<Category>>(
      `/restaurants/${restaurantId}/categories/${categoryId}`,
      data
    );
    return response.data.data;
  },

  // Delete category
  deleteCategory: async (restaurantId: string, categoryId: string): Promise<void> => {
    await apiClient.delete(`/restaurants/${restaurantId}/categories/${categoryId}`);
  },

  // Get menu items
  getMenuItems: async (restaurantId: string): Promise<MenuItem[]> => {
    const response = await apiClient.get<ApiResponse<MenuItem[]>>(
      `/restaurants/${restaurantId}/menu-items`
    );
    return response.data.data;
  },

  // Create menu item
  createMenuItem: async (restaurantId: string, data: CreateMenuItemRequest): Promise<MenuItem> => {
    const response = await apiClient.post<ApiResponse<MenuItem>>(
      `/restaurants/${restaurantId}/menu-items`,
      data
    );
    return response.data.data;
  },

  // Update menu item
  updateMenuItem: async (
    restaurantId: string,
    itemId: string,
    data: Partial<MenuItem>
  ): Promise<MenuItem> => {
    const response = await apiClient.patch<ApiResponse<MenuItem>>(
      `/restaurants/${restaurantId}/menu-items/${itemId}`,
      data
    );
    return response.data.data;
  },

  // Delete menu item
  deleteMenuItem: async (restaurantId: string, itemId: string): Promise<void> => {
    await apiClient.delete(`/restaurants/${restaurantId}/menu-items/${itemId}`);
  },
};
