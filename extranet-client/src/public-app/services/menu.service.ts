// src/public-app/services/menu.service.ts
import axios, { AxiosError } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

interface Category {
  _id: string;
  restaurantId: string;
  branchId?: string;
  name: string;
  description?: string;
  image?: string;
  displayOrder: number;
  scope: 'restaurant' | 'branch';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface CategoryListResponse {
  categories: Category[];
}

interface CategoryCountResponse {
  count: number;
}

export class PublicMenuService {
  /**
   * Get all categories for a restaurant (public access, no auth required)
   */
  static async getPublicCategories(
    restaurantId: string,
    branchId?: string
  ): Promise<ApiResponse<CategoryListResponse>> {
    try {
      const params = branchId ? { branchId } : {};
      const response = await axios.get(
        `${API_BASE_URL}/categories/public/${restaurantId}`,
        { params }
      );
      return {
        success: true,
        data: response.data.data,
        message: response.data.message,
      };
    } catch (error) {
      if (error instanceof AxiosError) {
        return {
          success: false,
          error: error.response?.data?.message || 'Failed to fetch categories',
        };
      }
      return {
        success: false,
        error: 'An unexpected error occurred',
      };
    }
  }

  /**
   * Get category count for a restaurant (public access, no auth required)
   * Useful for auto-incrementing display order
   */
  static async getPublicCategoryCount(
    restaurantId: string,
    scope: 'restaurant' | 'branch' = 'restaurant'
  ): Promise<ApiResponse<CategoryCountResponse>> {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/categories/public/${restaurantId}/count`,
        { params: { scope } }
      );
      return {
        success: true,
        data: response.data.data,
        message: response.data.message,
      };
    } catch (error) {
      if (error instanceof AxiosError) {
        return {
          success: false,
          error: error.response?.data?.message || 'Failed to fetch category count',
        };
      }
      return {
        success: false,
        error: 'An unexpected error occurred',
      };
    }
  }
}