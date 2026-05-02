// src/services/menu.service.ts

import axiosInstance from '@/shared/services/axios.service';
import { ApiResponse } from '@/shared/types';
import { extractId } from '@/shared/utils/id.util';
import {
  MenuItem,
  Category,
  CreateMenuItemPayload,
  CreateCategoryPayload,
  MenuItemListResponse,
  CategoryListResponse,
} from '@/shared/types/menu.types';

export class MenuService {
  private static getHeaders(token?: string | null): Record<string, string> {
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  // Category APIs
  static async getCategories(token: string, restaurantId: any) {
    const rId = extractId(restaurantId);
    const response = await axiosInstance.get<ApiResponse<CategoryListResponse>>(
      `/restaurants/${rId}/categories`,
      { headers: this.getHeaders(token) }
    );
    return response.data;
  }

  static async getCategory(token: string, restaurantId: any, categoryId: string) {
    const rId = extractId(restaurantId);
    const response = await axiosInstance.get<ApiResponse<Category>>(
      `/restaurants/${rId}/categories/${categoryId}`,
      { headers: this.getHeaders(token) }
    );
    return response.data;
  }

  static async createCategory(token: string, restaurantId: any, payload: CreateCategoryPayload) {
    const rId = extractId(restaurantId);
    const response = await axiosInstance.post<ApiResponse<Category>>(
      `/restaurants/${rId}/categories`,
      payload,
      { headers: this.getHeaders(token) }
    );
    return response.data;
  }

  static async updateCategory(
    token: string,
    restaurantId: any,
    categoryId: string,
    payload: Partial<CreateCategoryPayload>
  ) {
    const rId = extractId(restaurantId);
    const response = await axiosInstance.put<ApiResponse<Category>>(
      `/restaurants/${rId}/categories/${categoryId}`,
      payload,
      { headers: this.getHeaders(token) }
    );
    return response.data;
  }

  /**
   * Get category count for auto-incrementing display order
   * Uses public endpoint (no auth required)
   */
  static async getCategoryCount(
    _token: string,
    restaurantId: any,
    scope: 'restaurant' | 'branch' = 'restaurant'
  ) {
    const rId = extractId(restaurantId);
    const response = await axiosInstance.get<ApiResponse<{ count: number }>>(
      `/public/categories/${rId}/count?scope=${scope}`
    );
    return response.data;
  }

  // Menu Item APIs
  static async getMenuItems(
    token: string,
    restaurantId: any,
    page: number = 1,
    limit: number = 50
  ) {
    const rId = extractId(restaurantId);
    const response = await axiosInstance.get<ApiResponse<MenuItemListResponse>>(
      `/restaurants/${rId}/menu-items?page=${page}&limit=${limit}`,
      { headers: this.getHeaders(token) }
    );
    return response.data;
  }

  static async getMenuItem(token: string, restaurantId: any, menuItemId: string) {
    const rId = extractId(restaurantId);
    const response = await axiosInstance.get<ApiResponse<MenuItem>>(
      `/restaurants/${rId}/menu-items/${menuItemId}`,
      { headers: this.getHeaders(token) }
    );
    return response.data;
  }

  static async getMenuItemsByCategory(
    token: string,
    restaurantId: any,
    categoryId: string,
    page: number = 1,
    limit: number = 50
  ) {
    const rId = extractId(restaurantId);
    const response = await axiosInstance.get<ApiResponse<MenuItemListResponse>>(
      `/restaurants/${rId}/menu-items/category/${categoryId}?page=${page}&limit=${limit}`,
      { headers: this.getHeaders(token) }
    );
    return response.data;
  }

  static async createMenuItem(
    token: string,
    restaurantId: any,
    payload: CreateMenuItemPayload
  ) {
    const rId = extractId(restaurantId);
    const response = await axiosInstance.post<ApiResponse<MenuItem>>(
      `/restaurants/${rId}/menu-items`,
      payload,
      { headers: this.getHeaders(token) }
    );
    return response.data;
  }

  static async updateMenuItem(
    token: string,
    restaurantId: any,
    menuItemId: string,
    payload: Partial<CreateMenuItemPayload>
  ) {
    const rId = extractId(restaurantId);
    const response = await axiosInstance.put<ApiResponse<MenuItem>>(
      `/restaurants/${rId}/menu-items/${menuItemId}`,
      payload,
      { headers: this.getHeaders(token) }
    );
    return response.data;
  }

  static async updateAvailability(
    token: string,
    restaurantId: any,
    menuItemId: string,
    isAvailable: boolean
  ) {
    const rId = extractId(restaurantId);
    const response = await axiosInstance.patch<ApiResponse<MenuItem>>(
      `/restaurants/${rId}/menu-items/${menuItemId}/availability`,
      { isAvailable },
      { headers: this.getHeaders(token) }
    );
    return response.data;
  }

  static async deleteMenuItem(token: string, restaurantId: any, menuItemId: string) {
    const rId = extractId(restaurantId);
    const response = await axiosInstance.delete<ApiResponse<MenuItem>>(
      `/restaurants/${rId}/menu-items/${menuItemId}`,
      { headers: this.getHeaders(token) }
    );
    return response.data;
  }

  static async updateCategoryDisplayOrder(
    token: string,
    restaurantId: any,
    categoryId: string,
    displayOrder: number
  ) {
    const rId = extractId(restaurantId);
    const response = await axiosInstance.patch<ApiResponse<Category>>(
      `/restaurants/${rId}/categories/${categoryId}/display-order`,
      { displayOrder },
      { headers: this.getHeaders(token) }
    );
    return response.data;
  }
}
