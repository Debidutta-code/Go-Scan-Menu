// src/services/staff.service.ts

import { ApiResponse } from '../types';
import { Staff, StaffLoginResponse, CreateStaffPayload, StaffListResponse, UpdateStaffPayload } from '../types/staff.types';

const API_BASE_URL = 'http://localhost:8080/api/v1';

export class StaffService {
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

  static async login(email: string, password: string, role: string) {
    return this.request<StaffLoginResponse>(
      '/staff/login',
      {
        method: 'POST',
        body: JSON.stringify({ email, password, role }),
      }
    );
  }

  static async createStaff(token: string, payload: CreateStaffPayload) {
    return this.request<Staff>(
      '/staff',
      {
        method: 'POST',
        body: JSON.stringify(payload),
      },
      token
    );
  }

  static async getStaffByRestaurant(
    token: string,
    restaurantId: string,
    page: number = 1,
    limit: number = 10,
    filter: any = {}
  ) {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      filter: JSON.stringify(filter),
    });

    return this.request<StaffListResponse>(
      `/staff/restaurant/${restaurantId}?${queryParams.toString()}`,
      {},
      token
    );
  }

  static async getStaff(token: string, staffId: string) {
    return this.request<Staff>(
      `/staff/${staffId}`,
      {},
      token
    );
  }

    static async updateStaff(token: string, staffId: string, data: UpdateStaffPayload) {
    return this.request<Staff>(
      `/staff/${staffId}`,
      {
        method: 'PUT',
        body: JSON.stringify(data),
      },
      token
    );
  }

  static async updateStaffType(token: string, staffId: string, staffType: string) {
    return this.request<Staff>(
      `/staff/${staffId}/staff-type`,
      {
        method: 'PUT',
        body: JSON.stringify({ staffType }),
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
      {},
      token
    );
  }
}
