// src/services/branch.service.ts

import axiosInstance from '@/shared/services/axios.service';
import { ApiResponse } from '@/shared/types';
import { Branch, BranchListResponse } from '@/shared/types/table.types';

export class BranchService {
  private static getHeaders(token: string) {
    return {
      Authorization: `Bearer ${token}`,
    };
  }

  static async getBranches(
    token: string,
    restaurantId: any,
    page: number = 1,
    limit: number = 100
  ): Promise<ApiResponse<BranchListResponse>> {
    try {
      const rId = typeof restaurantId === 'object' ? restaurantId._id : restaurantId;
      const response = await axiosInstance.get(
        `/restaurants/${rId}/branches?page=${page}&limit=${limit}`,
        { headers: this.getHeaders(token) }
      );

      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Failed to fetch branches';
      throw new Error(message);
    }
  }

  static async getBranch(
    token: string,
    restaurantId: any,
    branchId: string
  ): Promise<ApiResponse<Branch>> {
    try {
      const rId = typeof restaurantId === 'object' ? restaurantId._id : restaurantId;
      const response = await axiosInstance.get(
        `/restaurants/${rId}/branches/${branchId}`,
        { headers: this.getHeaders(token) }
      );

      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Failed to fetch branch';
      throw new Error(message);
    }
  }
}