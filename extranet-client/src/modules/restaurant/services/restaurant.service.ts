// src/services/restaurant.service.ts

import { Restaurant, CreateRestaurantDto, PaginatedResponse } from '@/shared/types/restaurant.types';
import { ApiResponse } from '@/shared/types';
import { extractId } from '@/shared/utils/id.util';
import axiosInstance from '@/shared/services/axios.service';

export class RestaurantService {
  private static getHeaders(token: string): Record<string, string> {
    return {
      'Authorization': `Bearer ${token}`,
    };
  }

  static async getRestaurants(
    token: string,
    page: number = 1,
    limit: number = 10,
    filters?: any
  ): Promise<ApiResponse<PaginatedResponse<Restaurant>>> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (filters) {
      params.append('filter', JSON.stringify(filters));
    }

    const response = await axiosInstance.get(`/restaurants?${params}`, {
      headers: this.getHeaders(token),
    });

    return response.data;
  }

  static async getRestaurant(
    token: string,
    id: any
  ): Promise<ApiResponse<Restaurant>> {
    const rId = extractId(id);
    const response = await axiosInstance.get(`/restaurants/${rId}`, {
      headers: this.getHeaders(token),
    });

    return response.data;
  }

  static async createRestaurant(
    token: string,
    data: CreateRestaurantDto
  ): Promise<ApiResponse<{ restaurant: Restaurant }>> {
    const response = await axiosInstance.post(`/restaurants`, data, {
      headers: this.getHeaders(token),
    });

    return response.data;
  }

  static async updateRestaurant(
    token: string,
    id: any,
    data: Partial<Restaurant>
  ): Promise<ApiResponse<Restaurant>> {
    const rId = extractId(id);
    const response = await axiosInstance.put(`/restaurants/${rId}`, data, {
      headers: this.getHeaders(token),
    });

    return response.data;
  }

  static async deleteRestaurant(
    token: string,
    id: any
  ): Promise<ApiResponse<Restaurant>> {
    const rId = extractId(id);
    const response = await axiosInstance.delete(`/restaurants/${rId}`, {
      headers: this.getHeaders(token),
    });

    return response.data;
  }
  
  static async updateTheme(
    token: string,
    id: any,
    theme: Partial<Restaurant['theme']>
  ): Promise<ApiResponse<Restaurant>> {
    const rId = extractId(id);
    const response = await axiosInstance.put(`/restaurants/${rId}/theme`, theme, {
      headers: this.getHeaders(token),
    });

    return response.data;
  }

  static async updateSubscription(
    token: string,
    id: any,
    subscription: Partial<Restaurant['subscription']>
  ): Promise<ApiResponse<Restaurant>> {
    const rId = extractId(id);
    const response = await axiosInstance.put(`/restaurants/${rId}/subscription`, subscription, {
      headers: this.getHeaders(token),
    });

    return response.data;
  }

  static async updateSettings(
    token: string,
    id: any,
    settings: Partial<Restaurant['defaultSettings']>
  ): Promise<ApiResponse<Restaurant>> {
    const rId = extractId(id);
    const response = await axiosInstance.put(`/restaurants/${rId}/settings`, settings, {
      headers: this.getHeaders(token),
    });

    return response.data;
  }

}