// src/services/restaurant.service.ts

import { Restaurant, CreateRestaurantDto, PaginatedResponse } from '../types/restaurant.types';
import { ApiResponse } from '../types';
import env from '@/config/env';

export class RestaurantService {
  private static getHeaders(token: string): HeadersInit {
    return {
      'Content-Type': 'application/json',
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

    const response = await fetch(`${env.API_BASE_URL}/restaurants?${params}`, {
      headers: this.getHeaders(token),
    });

    return response.json();
  }

  static async getRestaurant(
    token: string,
    id: string
  ): Promise<ApiResponse<Restaurant>> {
    const response = await fetch(`${env.API_BASE_URL}/restaurants/${id}`, {
      headers: this.getHeaders(token),
    });

    return response.json();
  }

  static async createRestaurant(
    token: string,
    data: CreateRestaurantDto
  ): Promise<ApiResponse<{ restaurant: Restaurant }>> {
    const response = await fetch(`${env.API_BASE_URL}/restaurants`, {
      method: 'POST',
      headers: this.getHeaders(token),
      body: JSON.stringify(data),
    });

    return response.json();
  }

  static async updateRestaurant(
    token: string,
    id: string,
    data: Partial<Restaurant>
  ): Promise<ApiResponse<Restaurant>> {
    const response = await fetch(`${env.API_BASE_URL}/restaurants/${id}`, {
      method: 'PUT',
      headers: this.getHeaders(token),
      body: JSON.stringify(data),
    });

    return response.json();
  }

  static async deleteRestaurant(
    token: string,
    id: string
  ): Promise<ApiResponse<Restaurant>> {
    const response = await fetch(`${env.API_BASE_URL}/restaurants/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(token),
    });

    return response.json();
  }
  
  static async updateTheme(
    token: string,
    id: string,
    theme: Partial<Restaurant['theme']>
  ): Promise<ApiResponse<Restaurant>> {
    const response = await fetch(`${env.API_BASE_URL}/restaurants/${id}/theme`, {
      method: 'PUT',
      headers: this.getHeaders(token),
      body: JSON.stringify(theme),
    });

    return response.json();
  }

  static async updateSubscription(
    token: string,
    id: string,
    subscription: Partial<Restaurant['subscription']>
  ): Promise<ApiResponse<Restaurant>> {
    const response = await fetch(`${env.API_BASE_URL}/restaurants/${id}/subscription`, {
      method: 'PUT',
      headers: this.getHeaders(token),
      body: JSON.stringify(subscription),
    });

    return response.json();
  }

  static async updateSettings(
    token: string,
    id: string,
    settings: Partial<Restaurant['defaultSettings']>
  ): Promise<ApiResponse<Restaurant>> {
    const response = await fetch(`${env.API_BASE_URL}/restaurants/${id}/settings`, {
      method: 'PUT',
      headers: this.getHeaders(token),
      body: JSON.stringify(settings),
    });

    return response.json();
  }

}