// src/services/qrconfig.service.ts

import axiosInstance from '@/shared/services/axios.service';
import { ApiResponse } from '@/shared/types';
import { extractId } from '@/shared/utils/id.util';

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
  private static getHeaders(token: string): Record<string, string> {
    return {
      Authorization: `Bearer ${token}`,
    };
  }

  static async getQRConfig(
    token: string,
    restaurantId: any
  ): Promise<ApiResponse<QRConfig>> {
    const rId = extractId(restaurantId);
    const response = await axiosInstance.get(`/restaurants/${rId}/qr-config`, {
      headers: this.getHeaders(token),
    });
    return response.data;
  }

  static async saveQRConfig(
    token: string,
    restaurantId: any,
    config: Partial<QRConfig>
  ): Promise<ApiResponse<QRConfig>> {
    const rId = extractId(restaurantId);
    const response = await axiosInstance.post(
      `/restaurants/${rId}/qr-config`,
      config,
      { headers: this.getHeaders(token) }
    );
    return response.data;
  }

  static async resetQRConfig(
    token: string,
    restaurantId: any
  ): Promise<ApiResponse<QRConfig>> {
    const rId = extractId(restaurantId);
    const response = await axiosInstance.post(
      `/restaurants/${rId}/qr-config/reset`,
      {},
      { headers: this.getHeaders(token) }
    );
    return response.data;
  }

  static async deleteQRConfig(
    token: string,
    restaurantId: any
  ): Promise<ApiResponse<QRConfig>> {
    const rId = extractId(restaurantId);
    const response = await axiosInstance.delete(`/restaurants/${rId}/qr-config`, {
      headers: this.getHeaders(token),
    });
    return response.data;
  }
}
