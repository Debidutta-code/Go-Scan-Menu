// src/services/table.service.ts

import axiosInstance from './axios.service';
import { ApiResponse } from '../types';
import {
  Table,
  CreateTablePayload,
  BulkCreateTablePayload,
  UpdateTablePayload,
  TableListResponse,
} from '../types/table.types';

export class TableService {
  private static getHeaders(token: string) {
    return {
      Authorization: `Bearer ${token}`,
    };
  }

  private static getRestaurantId(restaurantId: any): string {
    if (!restaurantId) return '';
    if (typeof restaurantId === 'string') return restaurantId;
    return restaurantId._id || restaurantId.id || '';
  }

  static async getTables(
    token: string,
    restaurantId: any,
    branchId?: string,
    page: number = 1,
    limit: number = 100
  ): Promise<ApiResponse<TableListResponse>> {
    try {
      const rId = this.getRestaurantId(restaurantId);
      const endpoint = branchId
        ? `/restaurants/${rId}/tables/branch/${branchId}?page=${page}&limit=${limit}`
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
    branchId: string,
    payload: CreateTablePayload
  ): Promise<ApiResponse<Table>> {
    try {
      const rId = this.getRestaurantId(restaurantId);
      const response = await axiosInstance.post(
        `/restaurants/${rId}/tables`,
        { ...payload, branchId },
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
    tableId: string,
    payload: UpdateTablePayload
  ): Promise<ApiResponse<Table>> {
    try {
      const rId = this.getRestaurantId(restaurantId);
      const response = await axiosInstance.put(
        `/restaurants/${rId}/tables/${tableId}`,
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
    tableId: string,
    status: Table['status']
  ): Promise<ApiResponse<Table>> {
    try {
      const rId = this.getRestaurantId(restaurantId);
      const response = await axiosInstance.patch(
        `/restaurants/${rId}/tables/${tableId}/status`,
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
    tableId: string
  ): Promise<ApiResponse<Table>> {
    try {
      const rId = this.getRestaurantId(restaurantId);
      const response = await axiosInstance.delete(
        `/restaurants/${rId}/tables/${tableId}`,
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
    tableId: string
  ): Promise<ApiResponse<Table>> {
    try {
      const rId = this.getRestaurantId(restaurantId);
      const response = await axiosInstance.post(
        `/restaurants/${rId}/tables/${tableId}/regenerate-qr`,
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
    tableId: string
  ): Promise<ApiResponse<{ qrUrl: string }>> {
    try {
      const rId = this.getRestaurantId(restaurantId);
      const response = await axiosInstance.get(
        `/restaurants/${rId}/tables/${tableId}/qr-data`,
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
    tableId: string
  ): string {
    const rId = this.getRestaurantId(restaurantId);
    // This remains as a direct URL as it's typically used in an <img> src
    const env = (window as any).env || { API_BASE_URL: '' }; 
    // In production we'd get this from config, for now let's hope it's consistent
    return `${axiosInstance.defaults.baseURL}/restaurants/${rId}/tables/${tableId}/qr-image?token=${token}`;
  }
}