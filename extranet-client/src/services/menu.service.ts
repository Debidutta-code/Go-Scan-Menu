// src/services/menu.service.ts

import env from '@/config/env';
import { ApiResponse } from '../types';
import {
  MenuItem,
  Category,
  CreateMenuItemPayload,
  CreateCategoryPayload,
  MenuItemListResponse,
  CategoryListResponse,
} from '../types/menu.types';

export class MenuService {
  private static getHeaders(token?: string | null): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  static async request<T>(
    endpoint: string,
    options: RequestInit = {},
    token?: string | null
  ): Promise<ApiResponse<T>> {
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
    } catch (error) {
      throw error instanceof Error ? error : new Error('Network error');
    }
  }

  private static getRestaurantId(restaurantId: any): string {
    if (!restaurantId) return '';
    if (typeof restaurantId === 'string') return restaurantId;
    return restaurantId._id || restaurantId.id || '';
  }

  // Category APIs
  static async getCategories(token: string, restaurantId: any) {
    const rId = this.getRestaurantId(restaurantId);
    return this.request<CategoryListResponse>(
      `/restaurants/${rId}/categories`,
      {},
      token
    );
  }

  static async getCategory(token: string, restaurantId: any, categoryId: string) {
    const rId = this.getRestaurantId(restaurantId);
    return this.request<Category>(
      `/restaurants/${rId}/categories/${categoryId}`,
      {},
      token
    );
  }

  static async createCategory(token: string, restaurantId: any, payload: CreateCategoryPayload) {
    const rId = this.getRestaurantId(restaurantId);
    return this.request<Category>(
      `/restaurants/${rId}/categories`,
      {
        method: 'POST',
        body: JSON.stringify(payload),
      },
      token
    );
  }

  static async updateCategory(
    token: string,
    restaurantId: any,
    categoryId: string,
    payload: Partial<CreateCategoryPayload>
  ) {
    const rId = this.getRestaurantId(restaurantId);
    return this.request<Category>(
      `/restaurants/${rId}/categories/${categoryId}`,
      {
        method: 'PUT',
        body: JSON.stringify(payload),
      },
      token
    );
  }

  /**
   * Get category count for auto-incrementing display order
   * Uses public endpoint (no auth required)
   */
  static async getCategoryCount(
    token: string,
    restaurantId: any,
    scope: 'restaurant' | 'branch' = 'restaurant'
  ) {
    const rId = this.getRestaurantId(restaurantId);
    return this.request<{ count: number }>(
      `/categories/public/${rId}/count?scope=${scope}`,
      {},
      null // No token needed for public endpoint
    );
  }

  // Menu Item APIs
  static async getMenuItems(
    token: string,
    restaurantId: any,
    page: number = 1,
    limit: number = 50
  ) {
    const rId = this.getRestaurantId(restaurantId);
    return this.request<MenuItemListResponse>(
      `/restaurants/${rId}/menu-items?page=${page}&limit=${limit}`,
      {},
      token
    );
  }

  static async getMenuItem(token: string, restaurantId: any, menuItemId: string) {
    const rId = this.getRestaurantId(restaurantId);
    return this.request<MenuItem>(
      `/restaurants/${rId}/menu-items/${menuItemId}`,
      {},
      token
    );
  }

  static async getMenuItemsByCategory(
    token: string,
    restaurantId: any,
    categoryId: string,
    page: number = 1,
    limit: number = 50
  ) {
    const rId = this.getRestaurantId(restaurantId);
    return this.request<MenuItemListResponse>(
      `/restaurants/${rId}/menu-items/category/${categoryId}?page=${page}&limit=${limit}`,
      {},
      token
    );
  }

  static async createMenuItem(
    token: string,
    restaurantId: any,
    payload: CreateMenuItemPayload
  ) {
    const rId = this.getRestaurantId(restaurantId);
    return this.request<MenuItem>(
      `/restaurants/${rId}/menu-items`,
      {
        method: 'POST',
        body: JSON.stringify(payload),
      },
      token
    );
  }

  static async updateMenuItem(
    token: string,
    restaurantId: any,
    menuItemId: string,
    payload: Partial<CreateMenuItemPayload>
  ) {
    const rId = this.getRestaurantId(restaurantId);
    return this.request<MenuItem>(
      `/restaurants/${rId}/menu-items/${menuItemId}`,
      {
        method: 'PUT',
        body: JSON.stringify(payload),
      },
      token
    );
  }

  static async updateAvailability(
    token: string,
    restaurantId: any,
    menuItemId: string,
    isAvailable: boolean
  ) {
    const rId = this.getRestaurantId(restaurantId);
    return this.request<MenuItem>(
      `/restaurants/${rId}/menu-items/${menuItemId}/availability`,
      {
        method: 'PATCH',
        body: JSON.stringify({ isAvailable }),
      },
      token
    );
  }

  static async deleteMenuItem(token: string, restaurantId: any, menuItemId: string) {
    const rId = this.getRestaurantId(restaurantId);
    return this.request<MenuItem>(
      `/restaurants/${rId}/menu-items/${menuItemId}`,
      {
        method: 'DELETE',
      },
      token
    );
  }

  static async updateCategoryDisplayOrder(
    token: string,
    restaurantId: any,
    categoryId: string,
    displayOrder: number
  ) {
    const rId = this.getRestaurantId(restaurantId);
    return this.request<Category>(
      `/restaurants/${rId}/categories/${categoryId}/display-order`,
      {
        method: 'PATCH',
        body: JSON.stringify({ displayOrder }),
      },
      token
    );
  }
}
