// src/services/menu.service.ts

import { ApiResponse } from '../types';
import {
  MenuItem,
  Category,
  CreateMenuItemPayload,
  CreateCategoryPayload,
  MenuItemListResponse,
  CategoryListResponse,
} from '../types/menu.types';

const API_BASE_URL = 'http://localhost:8080/api/v1';

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
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
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

  // Category APIs
  static async getCategories(token: string, restaurantId: any) {
    console.log("category id", restaurantId._id);
    return this.request<CategoryListResponse>(
      `/restaurants/${restaurantId._id}/categories`,
      {},
      token
    );
  }

  static async getCategory(token: string, restaurantId: any, categoryId: string) {
    return this.request<Category>(
      `/restaurants/${restaurantId._id}/categories/${categoryId}`,
      {},
      token
    );
  }

  static async createCategory(token: string, restaurantId: any, payload: CreateCategoryPayload) {
    return this.request<Category>(
      `/restaurants/${restaurantId._id}/categories`,
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
    return this.request<Category>(
      `/restaurants/${restaurantId._id}/categories/${categoryId}`,
      {
        method: 'PUT',
        body: JSON.stringify(payload),
      },
      token
    );
  }

  // Menu Item APIs
  static async getMenuItems(
    token: string,
    restaurantId: any,
    page: number = 1,
    limit: number = 50
  ) {
    return this.request<MenuItemListResponse>(
      `/restaurants/${restaurantId._id}/menu-items?page=${page}&limit=${limit}`,
      {},
      token
    );
  }

  static async getMenuItem(token: string, restaurantId: any, menuItemId: string) {
    return this.request<MenuItem>(
      `/restaurants/${restaurantId._id}/menu-items/${menuItemId}`,
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
    return this.request<MenuItemListResponse>(
      `/restaurants/${restaurantId._id}/menu-items/category/${categoryId}?page=${page}&limit=${limit}`,
      {},
      token
    );
  }

  static async createMenuItem(
    token: string,
    restaurantId: any,
    payload: CreateMenuItemPayload
  ) {
    return this.request<MenuItem>(
      `/restaurants/${restaurantId._id}/menu-items`,
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
    return this.request<MenuItem>(
      `/restaurants/${restaurantId._id}/menu-items/${menuItemId}`,
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
    return this.request<MenuItem>(
      `/restaurants/${restaurantId._id}/menu-items/${menuItemId}/availability`,
      {
        method: 'PATCH',
        body: JSON.stringify({ isAvailable }),
      },
      token
    );
  }

  static async deleteMenuItem(token: string, restaurantId: any, menuItemId: string) {
    return this.request<MenuItem>(
      `/restaurants/${restaurantId._id}/menu-items/${menuItemId}`,
      {
        method: 'DELETE',
      },
      token
    );
  }
}
