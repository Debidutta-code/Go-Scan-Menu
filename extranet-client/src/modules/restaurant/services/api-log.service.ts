import axiosInstance from '@/shared/services/axios.service';
import { ApiResponse } from '@/shared/types';

export interface ApiLog {
  _id: string;
  method: string;
  url: string;
  headers: Record<string, any>;
  query: Record<string, any>;
  body: any;
  ip: string;
  statusCode: number;
  responseHeaders?: Record<string, any>;
  responseBody: any;
  duration: number;
  userId?: string;
  userEmail?: string;
  timestamp: string;
}

export interface ApiLogListResponse {
  logs: ApiLog[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export class ApiLogService {
  static async getLogs(
    token: string,
    page = 1,
    limit = 50,
    filters?: { method?: string; statusCode?: string; search?: string }
  ): Promise<ApiResponse<ApiLogListResponse>> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...filters
    });

    const response = await axiosInstance.get(`/superadmin/logs?${params.toString()}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  }
}
