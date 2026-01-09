// src/services/branch.service.ts

import { ApiResponse } from '../types';
import { Branch, BranchListResponse } from '../types/table.types';

const API_BASE_URL = 'http://localhost:8080/api/v1';

export class BranchService {
  private static getHeaders(token: string): HeadersInit {
    return {
      'Content-Type': 'application/json',
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
      const response = await fetch(
        `${API_BASE_URL}/restaurants/${restaurantId._id}/branches?page=${page}&limit=${limit}`,
        {
          method: 'GET',
          headers: this.getHeaders(token),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch branches');
      }

      return data;
    } catch (error) {
      throw error instanceof Error ? error : new Error('Network error');
    }
  }

  static async getBranch(
    token: string,
    restaurantId: any,
    branchId: string
  ): Promise<ApiResponse<Branch>> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/restaurants/${restaurantId._id}/branches/${branchId}`,
        {
          method: 'GET',
          headers: this.getHeaders(token),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch branch');
      }

      return data;
    } catch (error) {
      throw error instanceof Error ? error : new Error('Network error');
    }
  }
}