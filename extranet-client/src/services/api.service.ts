// src/services/api.service.ts

import { SuperAdmin, ApiResponse } from '../types';

const API_BASE_URL = 'http://localhost:8080/api/v1';

export class ApiService {
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

  static async login(email: string, password: string) {
    return this.request<{ superAdmin: SuperAdmin; token: string }>(
      '/superadmin/auth/login',
      {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }
    );
  }

  static async register(name: string, email: string, password: string) {
    return this.request<{ superAdmin: SuperAdmin; token: string }>(
      '/superadmin/auth/register',
      {
        method: 'POST',
        body: JSON.stringify({ name, email, password }),
      }
    );
  }

  static async getProfile(token: string) {
    return this.request<SuperAdmin>('/superadmin/auth/profile', {}, token);
  }
}