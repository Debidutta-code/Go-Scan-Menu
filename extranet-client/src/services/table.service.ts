// src/services/table.service.ts

import env from '@/config/env';
import { ApiResponse } from '../types';
import {
  Table,
  CreateTablePayload,
  BulkCreateTablePayload,
  UpdateTablePayload,
  TableListResponse,
} from '../types/table.types';

export class TableService {
  private static getHeaders(token: string): HeadersInit {
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };
  }

  static async getTables(
    token: string,
    restaurantId: any,
    branchId?: string,
    page: number = 1,
    limit: number = 100
  ): Promise<ApiResponse<TableListResponse>> {
    try {
      const endpoint = branchId
        ? `/restaurants/${restaurantId._id}/tables/branch/${branchId}?page=${page}&limit=${limit}`
        : `/restaurants/${restaurantId._id}/tables?page=${page}&limit=${limit}`;

      const response = await fetch(`${env.API_BASE_URL}${endpoint}`, {
        method: 'GET',
        headers: this.getHeaders(token),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch tables');
      }

      return data;
    } catch (error) {
      throw error instanceof Error ? error : new Error('Network error');
    }
  }

  static async createTable(
    token: string,
    restaurantId: any,
    branchId: string,
    payload: CreateTablePayload
  ): Promise<ApiResponse<Table>> {
    try {
      const response = await fetch(
        `${env.API_BASE_URL}/restaurants/${restaurantId._id}/tables`,
        {
          method: 'POST',
          headers: this.getHeaders(token),
          body: JSON.stringify({ ...payload, branchId }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create table');
      }

      return data;
    } catch (error) {
      throw error instanceof Error ? error : new Error('Network error');
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

      // Create tables one by one (backend doesn't have bulk endpoint)
      const createdTables: Table[] = [];
      const errors: string[] = [];

      for (const tableData of tables) {
        try {
          const result = await this.createTable(token, restaurantId._id, branchId, tableData);
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
    } catch (error) {
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
      const response = await fetch(
        `${env.API_BASE_URL}/restaurants/${restaurantId._id}/tables/${tableId}`,
        {
          method: 'PUT',
          headers: this.getHeaders(token),
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update table');
      }

      return data;
    } catch (error) {
      throw error instanceof Error ? error : new Error('Network error');
    }
  }

  static async updateTableStatus(
    token: string,
    restaurantId: any,
    tableId: string,
    status: Table['status']
  ): Promise<ApiResponse<Table>> {
    try {
      const response = await fetch(
        `${env.API_BASE_URL}/restaurants/${restaurantId._id}/tables/${tableId}/status`,
        {
          method: 'PATCH',
          headers: this.getHeaders(token),
          body: JSON.stringify({ status }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update table status');
      }

      return data;
    } catch (error) {
      throw error instanceof Error ? error : new Error('Network error');
    }
  }

  static async deleteTable(
    token: string,
    restaurantId: any,
    tableId: string
  ): Promise<ApiResponse<Table>> {
    try {
      const response = await fetch(
        `${env.API_BASE_URL}/restaurants/${restaurantId._id}/tables/${tableId}`,
        {
          method: 'DELETE',
          headers: this.getHeaders(token),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete table');
      }

      return data;
    } catch (error) {
      throw error instanceof Error ? error : new Error('Network error');
    }
  }

  static async regenerateQR(
    token: string,
    restaurantId: any,
    tableId: string
  ): Promise<ApiResponse<Table>> {
    try {
      const response = await fetch(
        `${env.API_BASE_URL}/restaurants/${restaurantId._id}/tables/${tableId}/regenerate-qr`,
        {
          method: 'POST',
          headers: this.getHeaders(token),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to regenerate QR code');
      }

      return data;
    } catch (error) {
      throw error instanceof Error ? error : new Error('Network error');
    }
  }

  static async getQRCodeData(
    token: string,
    restaurantId: any,
    tableId: string
  ): Promise<ApiResponse<{ qrUrl: string }>> {
    try {
      const response = await fetch(
        `${env.API_BASE_URL}/restaurants/${restaurantId._id}/tables/${tableId}/qr-data`,
        {
          method: 'GET',
          headers: this.getHeaders(token),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to get QR code data');
      }

      return data;
    } catch (error) {
      throw error instanceof Error ? error : new Error('Network error');
    }
  }

  static getQRCodeImageUrl(
    token: string,
    restaurantId: any,
    tableId: string
  ): string {
    return `${env.API_BASE_URL}/restaurants/${restaurantId._id}/tables/${tableId}/qr-image?token=${token}`;
  }
}