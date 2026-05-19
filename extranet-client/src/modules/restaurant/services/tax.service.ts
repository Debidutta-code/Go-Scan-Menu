// src/modules/restaurant/services/tax.service.ts
import axiosInstance from '@/shared/services/axios.service';
import { ApiResponse } from '@/shared/types';
import { ITax, CreateTaxDTO, UpdateTaxDTO, TaxListResponse } from '@/shared/types/tax.types';
import { extractId } from '@/shared/utils/id.util';

export class TaxService {
  private static getHeaders(token: string): Record<string, string> {
    return {
      'Authorization': `Bearer ${token}`,
    };
  }

  static async createTax(
    token: string,
    restaurantId: any,
    data: CreateTaxDTO
  ): Promise<ApiResponse<ITax>> {
    const rId = extractId(restaurantId);
    const response = await axiosInstance.post(`/restaurants/${rId}/taxes`, data, {
      headers: this.getHeaders(token),
    });
    return response.data;
  }

  static async getTaxesByRestaurant(
    token: string,
    restaurantId: any,
    scope: 'restaurant' | 'branch' = 'restaurant',
    page: number = 1,
    limit: number = 50
  ): Promise<ApiResponse<TaxListResponse>> {
    const rId = extractId(restaurantId);
    const response = await axiosInstance.get(`/restaurants/${rId}/taxes?scope=${scope}&page=${page}&limit=${limit}`, {
      headers: this.getHeaders(token),
    });
    return response.data;
  }

  static async getTax(
    token: string,
    restaurantId: any,
    id: string
  ): Promise<ApiResponse<ITax>> {
    const rId = extractId(restaurantId);
    const response = await axiosInstance.get(`/restaurants/${rId}/taxes/${id}`, {
      headers: this.getHeaders(token),
    });
    return response.data;
  }

  static async updateTax(
    token: string,
    restaurantId: any,
    id: string,
    data: UpdateTaxDTO
  ): Promise<ApiResponse<ITax>> {
    const rId = extractId(restaurantId);
    const response = await axiosInstance.put(`/restaurants/${rId}/taxes/${id}`, data, {
      headers: this.getHeaders(token),
    });
    return response.data;
  }

  static async updateTaxStatus(
    token: string,
    restaurantId: any,
    id: string,
    isActive: boolean
  ): Promise<ApiResponse<ITax>> {
    const rId = extractId(restaurantId);
    const response = await axiosInstance.patch(`/restaurants/${rId}/taxes/${id}/status`, { isActive }, {
      headers: this.getHeaders(token),
    });
    return response.data;
  }

  static async deleteTax(
    token: string,
    restaurantId: any,
    id: string
  ): Promise<ApiResponse<ITax>> {
    const rId = extractId(restaurantId);
    const response = await axiosInstance.delete(`/restaurants/${rId}/taxes/${id}`, {
      headers: this.getHeaders(token),
    });
    return response.data;
  }
}
