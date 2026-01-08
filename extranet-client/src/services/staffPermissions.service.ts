// src/services/staffPermissions.service.ts

import { ApiResponse } from '../types';
import { IStaffTypePermissions, StaffType, UpdatePermissionsPayload } from '../types/staffPermissions.types';

const API_BASE_URL = 'http://localhost:8080/api/v1';

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

  // GET all staff type permissions for a restaurant
  static async getAllStaffTypePermissions(token: string, restaurantId: string) {
    return this.request<IStaffTypePermissions[]>(
      `/staff-type-permissions/${restaurantId}`,
      {},
      token
    );
  }

  // GET permissions for a specific staff type
  static async getPermissionsForStaffType(token: string, restaurantId: string, staffType: StaffType) {
    return this.request<IStaffTypePermissions>(
      `/staff-type-permissions/${restaurantId}/${staffType}`,
      {},
      token
    );
  }

  // UPDATE permissions for a specific staff type
  static async updatePermissionsForStaffType(
    token: string,
    restaurantId: string,
    staffType: StaffType,
    payload: UpdatePermissionsPayload
  ) {
    return this.request<IStaffTypePermissions>(
      `/staff-type-permissions/${restaurantId}/${staffType}`,
      {
        method: 'PUT',
        body: JSON.stringify(payload),
      },
      token
    );
  }

  // Initialize all default permissions for a restaurant
  static async initializeAllPermissions(token: string, restaurantId: string) {
    return this.request<null>(
      `/staff-type-permissions/${restaurantId}/initialize`,
      {
        method: 'POST',
      },
      token
    );
  }
}
