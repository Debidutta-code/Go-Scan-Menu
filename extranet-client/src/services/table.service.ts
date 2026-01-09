// src/services/table.service.ts

import { ApiResponse } from '../types';
import {
  Table,
  CreateTablePayload,
  BulkCreateTablePayload,
  UpdateTablePayload,
  TableListResponse,
} from '../types/table.types';

const API_BASE_URL = 'http://localhost:8080/api/v1';

export class TableService {
  private static getHeaders(token: string): HeadersInit {
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };
  }

  static async getTables(
    token: string,
    restaurantId: string,
    branchId?: string,
    page: number = 1,
    limit: number = 100
  ): Promise<ApiResponse<TableListResponse>> {
    try {
      const endpoint = branchId
        ? `/restaurants/${restaurantId}/tables/branch/${branchId}?page=${page}&limit=${limit}`
        : `/restaurants/${restaurantId}/tables?page=${page}&limit=${limit}`;

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
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
    restaurantId: string,
    branchId: string,
    payload: CreateTablePayload
  ): Promise<ApiResponse<Table>> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/restaurants/${restaurantId}/tables`,
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
    restaurantId: string,
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
    } catch (error) {
      throw error instanceof Error ? error : new Error('Network error');
    }
  }

  static async updateTable(
    token: string,
    restaurantId: string,
    tableId: string,
    payload: UpdateTablePayload
  ): Promise<ApiResponse<Table>> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/restaurants/${restaurantId}/tables/${tableId}`,
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
    restaurantId: string,
    tableId: string,
    status: Table['status']
  ): Promise<ApiResponse<Table>> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/restaurants/${restaurantId}/tables/${tableId}/status`,
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
    restaurantId: string,
    tableId: string
  ): Promise<ApiResponse<Table>> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/restaurants/${restaurantId}/tables/${tableId}`,
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
    restaurantId: string,
    tableId: string
  ): Promise<ApiResponse<Table>> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/restaurants/${restaurantId}/tables/${tableId}/regenerate-qr`,
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
    restaurantId: string,
    tableId: string
  ): Promise<ApiResponse<{ qrUrl: string }>> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/restaurants/${restaurantId}/tables/${tableId}/qr-data`,
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
    restaurantId: string,
    tableId: string
  ): string {
    return `${API_BASE_URL}/restaurants/${restaurantId}/tables/${tableId}/qr-image?token=${token}`;
  }
}