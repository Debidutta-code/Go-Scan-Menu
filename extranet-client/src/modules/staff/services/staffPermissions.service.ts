// extranet-client/src/modules/staff/services/staffPermissions.service.ts

import env from '@/shared/config/env';
import { ApiResponse } from '@/shared/types';
import { IRole, StaffRole, UpdatePermissionsPayload } from '@/shared/types/staffPermissions.types';

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

  // GET all roles for a restaurant
  static async getAllRoles(token: string, restaurantId: string) {
    return this.request<IRole[]>(
      `/roles?restaurantId=${restaurantId}`,
      {},
      token
    );
  }

  // GET role by ID
  static async getRole(token: string, roleId: string) {
    return this.request<IRole>(
      `/roles/${roleId}`,
      {},
      token
    );
  }

  // UPDATE permissions for a specific role
  static async updateRolePermissions(
    token: string,
    roleId: string,
    payload: UpdatePermissionsPayload
  ) {
    return this.request<IRole>(
      `/roles/${roleId}/permissions`,
      {
        method: 'PUT',
        body: JSON.stringify(payload.permissions),
      },
      token
    );
  }
}
