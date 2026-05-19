// src/modules/restaurant/services/tax.service.ts
import axiosInstance from '@/shared/services/axios.service';
import { ApiResponse } from '@/shared/types';
import { ITax, CreateTaxDTO, UpdateTaxDTO, TaxListResponse } from '@/shared/types/tax.types';

export class TaxService {
  private static getHeaders(token: string): Record<string, string> {
    return {
      'Authorization': `Bearer ${token}`,
    };
  }

  static async createTax(
    token: string,
    data: CreateTaxDTO
  ): Promise<ApiResponse<ITax>> {
    const response = await axiosInstance.post('/taxes', data, {
      headers: this.getHeaders(token),
    });
    return response.data;
  }

  static async getTaxesByRestaurant(
    token: string,
    scope: 'restaurant' | 'branch' = 'restaurant',
    page: number = 1,
    limit: number = 50
  ): Promise<ApiResponse<TaxListResponse>> {
    const response = await axiosInstance.get(`/taxes?scope=${scope}&page=${page}&limit=${limit}`, {
      headers: this.getHeaders(token),
    });
    return response.data;
  }

  static async getTax(token: string, id: string): Promise<ApiResponse<ITax>> {
    const response = await axiosInstance.get(`/taxes/${id}`, {
      headers: this.getHeaders(token),
    });
    return response.data;
  }

  static async updateTax(
    token: string,
    id: string,
    data: UpdateTaxDTO
  ): Promise<ApiResponse<ITax>> {
    const response = await axiosInstance.put(`/taxes/${id}`, data, {
      headers: this.getHeaders(token),
    });
    return response.data;
  }

  static async updateTaxStatus(
    token: string,
    id: string,
    isActive: boolean
  ): Promise<ApiResponse<ITax>> {
    const response = await axiosInstance.patch(`/taxes/${id}/status`, { isActive }, {
      headers: this.getHeaders(token),
    });
    return response.data;
  }

  static async deleteTax(token: string, id: string): Promise<ApiResponse<ITax>> {
    const response = await axiosInstance.delete(`/taxes/${id}`, {
      headers: this.getHeaders(token),
    });
    return response.data;
  }
}
