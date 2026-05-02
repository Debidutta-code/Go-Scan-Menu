// src/services/staffPermissions.service.ts

import axiosInstance from '@/shared/services/axios.service';
import { ApiResponse } from '@/shared/types';
import { extractId } from '@/shared/utils/id.util';
import { IStaffTypePermissions, StaffType, UpdatePermissionsPayload } from '@/shared/types/staffPermissions.types';
import { Role } from '@/shared/types/role.types';

export class StaffPermissionsService {
  private static getHeaders(token?: string | null): Record<string, string> {
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  // GET all staff type permissions for a restaurant (including levels and details)
  static async getAllRestaurantRoles(token: string, restaurantId: any) {
    const rId = extractId(restaurantId);
    const response = await axiosInstance.get<ApiResponse<Role[]>>(
      `/staff-type-permissions/${rId}`,
      { headers: this.getHeaders(token) }
    );
    return response.data;
  }

  // GET all staff type permissions for a restaurant
  static async getAllStaffTypePermissions(token: string, restaurantId: any) {
    const rId = extractId(restaurantId);
    const response = await axiosInstance.get<ApiResponse<IStaffTypePermissions[]>>(
      `/staff-type-permissions/${rId}`,
      { headers: this.getHeaders(token) }
    );
    return response.data;
  }

  // GET permissions for a specific staff type
  static async getPermissionsForStaffType(token: string, restaurantId: any, staffType: StaffType) {
    const rId = extractId(restaurantId);
    const response = await axiosInstance.get<ApiResponse<IStaffTypePermissions>>(
      `/staff-type-permissions/${rId}/${staffType}`,
      { headers: this.getHeaders(token) }
    );
    return response.data;
  }

  // UPDATE permissions for a specific staff type
  static async updatePermissionsForStaffType(
    token: string,
    restaurantId: any,
    staffType: StaffType,
    payload: UpdatePermissionsPayload
  ) {
    const rId = extractId(restaurantId);
    const response = await axiosInstance.put<ApiResponse<IStaffTypePermissions>>(
      `/staff-type-permissions/${rId}/${staffType}`,
      payload,
      { headers: this.getHeaders(token) }
    );
    return response.data;
  }

  // Initialize all default permissions for a restaurant
  static async initializeAllPermissions(token: string, restaurantId: any) {
    const rId = extractId(restaurantId);
    const response = await axiosInstance.post<ApiResponse<null>>(
      `/staff-type-permissions/${rId}/initialize`,
      {},
      { headers: this.getHeaders(token) }
    );
    return response.data;
  }
}
