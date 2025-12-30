import apiClient from '../lib/api';
import type { LoginRequest, LoginResponse, RegisterRequest, User } from '../types/auth.types';
import type { ApiResponse } from '../types/api.types';

export const authService = {
  // Login
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await apiClient.post<ApiResponse<LoginResponse>>('/staff/login', credentials);
    return response.data.data;
  },

  // Register
  register: async (data: RegisterRequest): Promise<LoginResponse> => {
    const response = await apiClient.post<ApiResponse<LoginResponse>>('/staff/register', data);
    return response.data.data;
  },

  // Get current user
  getCurrentUser: async (): Promise<User> => {
    const response = await apiClient.get<ApiResponse<User>>('/staff/me');
    return response.data.data;
  },

  // Logout
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
};
