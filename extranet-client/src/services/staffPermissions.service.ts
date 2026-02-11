// src/services/staffPermissions.service.ts

import env from '@/config/env';
import { ApiResponse } from '../types';
import { IStaffTypePermissions, StaffType, UpdatePermissionsPayload } from '../types/staffPermissions.types';

export class StaffPermissionsService {
  private static getHeaders(token?: string | null): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  private static async request<T>(
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

  // GET all staff type permissions for a restaurant
  static async getAllStaffTypePermissions(token: string, restaurantId: any) {
    return this.request<IStaffTypePermissions[]>(
      `/staff-type-permissions/${restaurantId._id}`,
      {},
      token
    );
  }

  // GET permissions for a specific staff type
  static async getPermissionsForStaffType(token: string, restaurantId: any, staffType: StaffType) {
    return this.request<IStaffTypePermissions>(
      `/staff-type-permissions/${restaurantId._id}/${staffType}`,
      {},
      token
    );
  }

  // UPDATE permissions for a specific staff type
  static async updatePermissionsForStaffType(
    token: string,
    restaurantId: any,
    staffType: StaffType,
    payload: UpdatePermissionsPayload
  ) {
    return this.request<IStaffTypePermissions>(
      `/staff-type-permissions/${restaurantId._id}/${staffType}`,
      {
        method: 'PUT',
        body: JSON.stringify(payload),
      },
      token
    );
  }

  // Initialize all default permissions for a restaurant
  static async initializeAllPermissions(token: string, restaurantId: any) {
    return this.request<null>(
      `/staff-type-permissions/${restaurantId._id}/initialize`,
      {
        method: 'POST',
      },
      token
    );
  }
}
