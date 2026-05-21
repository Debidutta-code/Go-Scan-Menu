// src/services/branch.service.ts

import axiosInstance from '@/shared/services/axios.service';
import { ApiResponse } from '@/shared/types';
import { extractId } from '@/shared/utils/id.util';
import { Branch, BranchListResponse } from '@/shared/types/table.types';

export class BranchService {
  private static getHeaders(customToken?: string) {
    const token = customToken || localStorage.getItem('staff_token');
    return {
      Authorization: `Bearer ${token}`,
    };
  }

  static async getAllBranches(
    restaurantId: any,
    token?: string
  ): Promise<ApiResponse<Branch[]>> {
    try {
      const rId = extractId(restaurantId);
      const response = await axiosInstance.get(
        `/restaurants/${rId}/branches?limit=1000`,
        { headers: this.getHeaders(token) }
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
    limit: number = 100,
    token?: string
  ): Promise<ApiResponse<BranchListResponse>> {
    try {
      const rId = extractId(restaurantId);
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
    restaurantId: any,
    branchId: any,
    token?: string
  ): Promise<ApiResponse<Branch>> {
    try {
      const rId = extractId(restaurantId);
      const bId = extractId(branchId);
      const response = await axiosInstance.get(
        `/restaurants/${rId}/branches/${bId}`,
        { headers: this.getHeaders(token) }
      );

      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Failed to fetch branch';
      throw new Error(message);
    }
  }

  static async createBranch(
    restaurantId: any,
    data: any,
    token?: string
  ): Promise<ApiResponse<Branch>> {
    try {
      const rId = extractId(restaurantId);
      const response = await axiosInstance.post(
        `/restaurants/${rId}/branches`,
        data,
        { headers: this.getHeaders(token) }
      );

      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Failed to create branch';
      throw new Error(message);
    }
  }

  static async updateBranch(
    restaurantId: any,
    branchId: any,
    data: any,
    token?: string
  ): Promise<ApiResponse<Branch>> {
    try {
      const rId = extractId(restaurantId);
      const bId = extractId(branchId);
      const response = await axiosInstance.put(
        `/restaurants/${rId}/branches/${bId}`,
        data,
        { headers: this.getHeaders(token) }
      );

      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Failed to update branch';
      throw new Error(message);
    }
  }

  static async deleteBranch(
    restaurantId: any,
    branchId: any,
    token?: string
  ): Promise<ApiResponse<void>> {
    try {
      const rId = extractId(restaurantId);
      const bId = extractId(branchId);
      const response = await axiosInstance.delete(
        `/restaurants/${rId}/branches/${bId}`,
        { headers: this.getHeaders(token) }
      );

      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Failed to delete branch';
      throw new Error(message);
    }
  }
}