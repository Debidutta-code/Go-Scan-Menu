// src/services/qrconfig.service.ts

import env from '@/config/env';
import { ApiResponse } from '../types';

export interface QRConfig {
  _id?: string;
  restaurantId: string;
  designMode: 'simple' | 'template';
  selectedStyle: string;
  selectedTemplate: string;
  customMode: boolean;
  fgColor: string;
  bgColor: string;
  level: 'L' | 'M' | 'Q' | 'H';
  logoSrc?: string;
  logoWidth?: number;
  logoHeight?: number;
  selectedCategory: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export class QRConfigService {
  private static getHeaders(token: string): HeadersInit {
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };
  }

  static async getQRConfig(
    token: string,
    restaurantId: any
  ): Promise<ApiResponse<QRConfig>> {
    try {
      const response = await fetch(
        `${env.API_BASE_URL}/restaurants/${restaurantId._id}/qr-config`,
        {
          method: 'GET',
          headers: this.getHeaders(token),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch QR config');
      }

      return data;
    } catch (error) {
      throw error instanceof Error ? error : new Error('Network error');
    }
  }

  static async saveQRConfig(
    token: string,
    restaurantId: any,
    config: Partial<QRConfig>
  ): Promise<ApiResponse<QRConfig>> {
    try {
      const response = await fetch(
        `${env.API_BASE_URL}/restaurants/${restaurantId._id}/qr-config`,
        {
          method: 'POST',
          headers: this.getHeaders(token),
          body: JSON.stringify(config),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to save QR config');
      }

      return data;
    } catch (error) {
      throw error instanceof Error ? error : new Error('Network error');
    }
  }

  static async resetQRConfig(
    token: string,
    restaurantId: any
  ): Promise<ApiResponse<QRConfig>> {
    try {
      const response = await fetch(
        `${env.API_BASE_URL}/restaurants/${restaurantId._id}/qr-config/reset`,
        {
          method: 'POST',
          headers: this.getHeaders(token),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to reset QR config');
      }

      return data;
    } catch (error) {
      throw error instanceof Error ? error : new Error('Network error');
    }
  }

  static async deleteQRConfig(
    token: string,
    restaurantId: any
  ): Promise<ApiResponse<QRConfig>> {
    try {
      const response = await fetch(
        `${env.API_BASE_URL}/restaurants/${restaurantId._id}/qr-config`,
        {
          method: 'DELETE',
          headers: this.getHeaders(token),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete QR config');
      }

      return data;
    } catch (error) {
      throw error instanceof Error ? error : new Error('Network error');
    }
  }
}
