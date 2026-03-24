// src/services/api.service.ts

import axiosInstance from '@/shared/services/axios.service';
import { SuperAdmin, ApiResponse } from '@/shared/types';

export class ApiService {
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
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      };

      const response = await axiosInstance(config);
      return response.data;
    } catch (error: any) {
      // Axios errors have a response object
      const errorMessage = error.response?.data?.message || error.message || 'Request failed';
      throw new Error(errorMessage);
    }
  }

  static async login(email: string, password: string) {
    return this.request<{ superAdmin: SuperAdmin; token: string }>(
      '/superadmin/auth/login',
      {
        method: 'POST',
        data: { email, password },
      }
    );
  }

  static async register(name: string, email: string, password: string) {
    return this.request<{ superAdmin: SuperAdmin; token: string }>(
      '/superadmin/auth/register',
      {
        method: 'POST',
        data: { name, email, password },
      }
    );
  }

  static async getProfile(token: string) {
    return this.request<SuperAdmin>('/superadmin/auth/profile', { method: 'GET' }, token);
  }
}