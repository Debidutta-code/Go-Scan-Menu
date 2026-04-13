// src/services/table.service.ts

import axiosInstance from '@/shared/services/axios.service';
import { ApiResponse } from '@/shared/types';
import { extractId } from '@/shared/utils/id.util';
import {
  Table,
  CreateTablePayload,
  BulkCreateTablePayload,
  UpdateTablePayload,
  TableListResponse,
} from '@/shared/types/table.types';

export class TableService {
  private static getHeaders(token: string) {
    return {
      Authorization: `Bearer ${token}`,
    };
  }

  static async getTables(
    token: string,
    restaurantId: any,
    branchIdOrObject?: any,
    page: number = 1,
    limit: number = 100
  ): Promise<ApiResponse<TableListResponse>> {
    try {
      const rId = extractId(restaurantId);
      const bId = extractId(branchIdOrObject);
      const endpoint = bId
        ? `/restaurants/${rId}/tables/branch/${bId}?page=${page}&limit=${limit}`
        : `/restaurants/${rId}/tables?page=${page}&limit=${limit}`;

      const response = await axiosInstance.get(endpoint, {
        headers: this.getHeaders(token),
      });

      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Failed to fetch tables';
      throw new Error(message);
    }
  }

  static async createTable(
    token: string,
    restaurantId: any,
    branchIdOrObject: any,
    payload: CreateTablePayload
  ): Promise<ApiResponse<Table>> {
    try {
      const rId = extractId(restaurantId);
      const bId = extractId(branchIdOrObject);
      const response = await axiosInstance.post(
        `/restaurants/${rId}/tables`,
        { ...payload, branchId: bId },
        { headers: this.getHeaders(token) }
      );

      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Failed to create table';
      throw new Error(message);
    }
  }

  static async createBulkTables(
    token: string,
    restaurantId: any,
    branchId: string,
    payload: BulkCreateTablePayload
  ): Promise<ApiResponse<{ tables: Table[]; created: number }>> {
    try {
      const tables: CreateTablePayload[] = [];
      for (let i = payload.startNumber; i <= payload.endNumber; i++) {
        tables.push({
          tableNumber: `${payload.prefix}${i}`,
          capacity: payload.capacity,
          location: payload.location || 'indoor',
        });
      }

      const createdTables: Table[] = [];
      const errors: string[] = [];

      for (const tableData of tables) {
        try {
          const result = await this.createTable(token, restaurantId, branchId, tableData);
          if (result.success && result.data) {
            createdTables.push(result.data);
          }
        } catch (err: any) {
          errors.push(`${tableData.tableNumber}: ${err.message}`);
        }
      }

      if (createdTables.length === 0) {
        throw new Error(`Failed to create tables. Errors: ${errors.join(', ')}`);
      }

      return {
        success: true,
        message: `Created ${createdTables.length} tables${errors.length > 0 ? `. Errors: ${errors.join(', ')}` : ''}`,
        data: {
          tables: createdTables,
          created: createdTables.length,
        },
      };
    } catch (error: any) {
      throw error instanceof Error ? error : new Error('Network error');
    }
  }

  static async updateTable(
    token: string,
    restaurantId: any,
    tableIdOrObject: any,
    payload: UpdateTablePayload
  ): Promise<ApiResponse<Table>> {
    try {
      const rId = extractId(restaurantId);
      const tId = extractId(tableIdOrObject);
      const response = await axiosInstance.put(
        `/restaurants/${rId}/tables/${tId}`,
        payload,
        { headers: this.getHeaders(token) }
      );

      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Failed to update table';
      throw new Error(message);
    }
  }

  static async updateTableStatus(
    token: string,
    restaurantId: any,
    tableIdOrObject: any,
    status: Table['status']
  ): Promise<ApiResponse<Table>> {
    try {
      const rId = extractId(restaurantId);
      const tId = extractId(tableIdOrObject);
      const response = await axiosInstance.patch(
        `/restaurants/${rId}/tables/${tId}/status`,
        { status },
        { headers: this.getHeaders(token) }
      );

      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Failed to update table status';
      throw new Error(message);
    }
  }

  static async deleteTable(
    token: string,
    restaurantId: any,
    tableIdOrObject: any
  ): Promise<ApiResponse<Table>> {
    try {
      const rId = extractId(restaurantId);
      const tId = extractId(tableIdOrObject);
      const response = await axiosInstance.delete(
        `/restaurants/${rId}/tables/${tId}`,
        { headers: this.getHeaders(token) }
      );

      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Failed to delete table';
      throw new Error(message);
    }
  }

  static async regenerateQR(
    token: string,
    restaurantId: any,
    tableIdOrObject: any
  ): Promise<ApiResponse<Table>> {
    try {
      const rId = extractId(restaurantId);
      const tId = extractId(tableIdOrObject);
      const response = await axiosInstance.post(
        `/restaurants/${rId}/tables/${tId}/regenerate-qr`,
        {},
        { headers: this.getHeaders(token) }
      );

      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Failed to regenerate QR code';
      throw new Error(message);
    }
  }

  static async getQRCodeData(
    token: string,
    restaurantId: any,
    tableIdOrObject: any
  ): Promise<ApiResponse<{ qrUrl: string }>> {
    try {
      const rId = extractId(restaurantId);
      const tId = extractId(tableIdOrObject);
      const response = await axiosInstance.get(
        `/restaurants/${rId}/tables/${tId}/qr-data`,
        { headers: this.getHeaders(token) }
      );

      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Failed to get QR code data';
      throw new Error(message);
    }
  }

  static getQRCodeImageUrl(
    token: string,
    restaurantId: any,
    tableIdOrObject: any
  ): string {
    const rId = extractId(restaurantId);
    const tId = extractId(tableIdOrObject);
    // This remains as a direct URL as it's typically used in an <img> src
    const env = (window as any).env || { API_BASE_URL: '' }; 
    // In production we'd get this from config, for now let's hope it's consistent
    return `${axiosInstance.defaults.baseURL}/restaurants/${rId}/tables/${tId}/qr-image?token=${token}`;
  }
}
