import axiosInstance from '@/shared/services/axios.service';
import { ApiResponse } from '@/shared/types';
import { extractId } from '@/shared/utils/id.util';
import { ModifierGroup, ModifierOption } from '@/shared/types/menu.types';

export class ModifierService {
  private static getHeaders(token?: string | null): Record<string, string> {
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  // Option APIs
  static async getOptions(token: string, restaurantId: any) {
    const rId = extractId(restaurantId);
    const response = await axiosInstance.get<ApiResponse<ModifierOption[]>>(
      `/restaurants/${rId}/modifiers/options`,
      { headers: this.getHeaders(token) }
    );
    return response.data;
  }

  static async createOption(token: string, restaurantId: any, payload: Partial<ModifierOption>) {
    const rId = extractId(restaurantId);
    const response = await axiosInstance.post<ApiResponse<ModifierOption>>(
      `/restaurants/${rId}/modifiers/options`,
      payload,
      { headers: this.getHeaders(token) }
    );
    return response.data;
  }

  static async updateOption(token: string, restaurantId: any, optionId: string, payload: Partial<ModifierOption>) {
    const rId = extractId(restaurantId);
    const response = await axiosInstance.patch<ApiResponse<ModifierOption>>(
      `/restaurants/${rId}/modifiers/options/${optionId}`,
      payload,
      { headers: this.getHeaders(token) }
    );
    return response.data;
  }

  static async deleteOption(token: string, restaurantId: any, optionId: string) {
    const rId = extractId(restaurantId);
    const response = await axiosInstance.delete<ApiResponse<any>>(
      `/restaurants/${rId}/modifiers/options/${optionId}`,
      { headers: this.getHeaders(token) }
    );
    return response.data;
  }

  // Group APIs
  static async getGroups(token: string, restaurantId: any) {
    const rId = extractId(restaurantId);
    const response = await axiosInstance.get<ApiResponse<ModifierGroup[]>>(
      `/restaurants/${rId}/modifiers/groups`,
      { headers: this.getHeaders(token) }
    );
    return response.data;
  }

  static async getGroup(token: string, restaurantId: any, groupId: string) {
    const rId = extractId(restaurantId);
    const response = await axiosInstance.get<ApiResponse<ModifierGroup>>(
      `/restaurants/${rId}/modifiers/groups/${groupId}`,
      { headers: this.getHeaders(token) }
    );
    return response.data;
  }

  static async createGroup(token: string, restaurantId: any, payload: Partial<ModifierGroup>) {
    const rId = extractId(restaurantId);
    const response = await axiosInstance.post<ApiResponse<ModifierGroup>>(
      `/restaurants/${rId}/modifiers/groups`,
      payload,
      { headers: this.getHeaders(token) }
    );
    return response.data;
  }

  static async updateGroup(token: string, restaurantId: any, groupId: string, payload: Partial<ModifierGroup>) {
    const rId = extractId(restaurantId);
    const response = await axiosInstance.patch<ApiResponse<ModifierGroup>>(
      `/restaurants/${rId}/modifiers/groups/${groupId}`,
      payload,
      { headers: this.getHeaders(token) }
    );
    return response.data;
  }

  static async deleteGroup(token: string, restaurantId: any, groupId: string) {
    const rId = extractId(restaurantId);
    const response = await axiosInstance.delete<ApiResponse<any>>(
      `/restaurants/${rId}/modifiers/groups/${groupId}`,
      { headers: this.getHeaders(token) }
    );
    return response.data;
  }
}
