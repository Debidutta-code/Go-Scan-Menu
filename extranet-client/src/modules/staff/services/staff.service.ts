// src/services/staff.service.ts

import axiosInstance from '@/shared/services/axios.service';
import { ApiResponse } from '@/shared/types';
import { extractId } from '@/shared/utils/id.util';
import { Staff, StaffLoginResponse, CreateStaffPayload, StaffListResponse, UpdateStaffPayload } from '@/shared/types/staff.types';

export class StaffService {
  private static getHeaders(token?: string | null) {
    const headers: any = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  static async request<T>(
    endpoint: string,
    options: any = {},
    token?: string | null
  ): Promise<ApiResponse<T>> {
    try {
      const config = {
        url: endpoint,
        ...options,
        headers: {
          ...options.headers,
          ...this.getHeaders(token),
        },
      };

      const response = await axiosInstance(config);
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Request failed';
      throw new Error(message);
    }
  }

  static async login(email: string, password: string) {
    return this.request<StaffLoginResponse>(
      '/staff/login',
      {
        method: 'POST',
        data: { email, password },
      }
    );
  }

  static async createStaff(token: string, payload: CreateStaffPayload) {
    return this.request<Staff>(
      '/staff',
      {
        method: 'POST',
        data: payload,
      },
      token
    );
  }

  static async getStaffByRestaurant(
    token: string,
    restaurantId: any,
    page: number = 1,
    limit: number = 10,
    filter: any = {}
  ) {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      filter: JSON.stringify(filter),
    });

    const rId = extractId(restaurantId);

    return this.request<StaffListResponse>(
      `/staff/restaurant/${rId}?${queryParams.toString()}`,
      { method: 'GET' },
      token
    );
  }

  static async getStaff(token: string, staffId: string) {
    return this.request<Staff>(
      `/staff/${staffId}`,
      { method: 'GET' },
      token
    );
  }

  static async updateStaff(token: string, staffId: string, data: UpdateStaffPayload) {
    return this.request<Staff>(
      `/staff/${staffId}`,
      {
        method: 'PUT',
        data: data,
      },
      token
    );
  }

  static async updateProfile(token: string, data: Partial<Staff>) {
    return this.request<Staff>(
      `/staff/profile`,
      {
        method: 'PUT',
        data: data,
      },
      token
    );
  }

  static async updateStaffType(token: string, staffId: string, staffType: string) {
    return this.request<Staff>(
      `/staff/${staffId}/staff-type`,
      {
        method: 'PUT',
        data: { staffType },
      },
      token
    );
  }

  static async deleteStaff(token: string, staffId: string) {
    return this.request<Staff>(
      `/staff/${staffId}`,
      {
        method: 'DELETE',
      },
      token
    );
  }

  static async getCurrentUser(token: string) {
    return this.request<Staff>(
      '/staff/me',
      { method: 'GET' },
      token
    );
  }

  static async changePassword(token: string, currentPassword: string, newPassword: string) {
    return this.request<any>(
      '/staff/change-password',
      {
        method: 'POST',
        data: { currentPassword, newPassword },
      },
      token
    );
  }
}
