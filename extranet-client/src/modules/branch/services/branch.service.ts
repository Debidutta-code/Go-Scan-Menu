// src/services/branch.service.ts

import axiosInstance from '@/shared/services/axios.service';
import { ApiResponse } from '@/shared/types';
import { extractId } from '@/shared/utils/id.util';
import { Branch, BranchListResponse } from '@/shared/types/table.types';

export class BranchService {
  private static getHeaders() {
    const token = localStorage.getItem('staff_token');
    return {
      Authorization: `Bearer ${token}`,
    };
  }

  static async getAllBranches(
    restaurantId: any
  ): Promise<ApiResponse<Branch[]>> {
    try {
      const rId = extractId(restaurantId);
      const response = await axiosInstance.get(
        `/restaurants/${rId}/branches`,
        { headers: this.getHeaders() }
      );

      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Failed to fetch branches';
      throw new Error(message);
    }
  }

  static async getBranches(
    restaurantId: any,
    page: number = 1,
    limit: number = 100
  ): Promise<ApiResponse<BranchListResponse>> {
    try {
      const rId = extractId(restaurantId);
      const response = await axiosInstance.get(
        `/restaurants/${rId}/branches?page=${page}&limit=${limit}`,
        { headers: this.getHeaders() }
      );

      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Failed to fetch branches';
      throw new Error(message);
    }
  }

  static async getBranch(
    restaurantId: any,
    branchId: any
  ): Promise<ApiResponse<Branch>> {
    try {
      const rId = extractId(restaurantId);
      const bId = extractId(branchId);
      const response = await axiosInstance.get(
        `/restaurants/${rId}/branches/${bId}`,
        { headers: this.getHeaders() }
      );

      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Failed to fetch branch';
      throw new Error(message);
    }
  }

  static async createBranch(
    restaurantId: any,
    data: any
  ): Promise<ApiResponse<Branch>> {
    try {
      const rId = extractId(restaurantId);
      const response = await axiosInstance.post(
        `/restaurants/${rId}/branches`,
        data,
        { headers: this.getHeaders() }
      );

      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Failed to create branch';
      throw new Error(message);
    }
  }
}