// src/services/staffPermissions.service.ts

import env from '@/shared/config/env';
import { ApiResponse } from '@/shared/types';
import { extractId } from '@/shared/utils/id.util';
import { IStaffTypePermissions, StaffType, UpdatePermissionsPayload } from '@/shared/types/staffPermissions.types';
import { Role } from '@/shared/types/role.types';

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

  // GET all staff type permissions for a restaurant (including levels and details)
  static async getAllRestaurantRoles(token: string, restaurantId: any) {
    const rId = extractId(restaurantId);
    return this.request<Role[]>(
      `/staff-type-permissions/${rId}`,
      {},
      token
    );
  }

  // GET all staff type permissions for a restaurant
  static async getAllStaffTypePermissions(token: string, restaurantId: any) {
    const rId = extractId(restaurantId);
    return this.request<IStaffTypePermissions[]>(
      `/staff-type-permissions/${rId}`,
      {},
      token
    );
  }

  // GET permissions for a specific staff type
  static async getPermissionsForStaffType(token: string, restaurantId: any, staffType: StaffType) {
    const rId = extractId(restaurantId);
    return this.request<IStaffTypePermissions>(
      `/staff-type-permissions/${rId}/${staffType}`,
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
    const rId = extractId(restaurantId);
    return this.request<IStaffTypePermissions>(
      `/staff-type-permissions/${rId}/${staffType}`,
      {
        method: 'PUT',
        body: JSON.stringify(payload),
      },
      token
    );
  }

  // Initialize all default permissions for a restaurant
  static async initializeAllPermissions(token: string, restaurantId: any) {
    const rId = extractId(restaurantId);
    return this.request<null>(
      `/staff-type-permissions/${rId}/initialize`,
      {
        method: 'POST',
      },
      token
    );
  }
}
