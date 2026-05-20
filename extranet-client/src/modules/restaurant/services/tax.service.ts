import axiosInstance from '@/shared/services/axios.service';
import { ITax, CreateTaxDTO, UpdateTaxDTO, TaxListResponse, SingleTaxResponse } from '@/shared/types/tax.types';

export class TaxService {
    static async createTax(token: string, restaurantId: string, data: CreateTaxDTO): Promise<SingleTaxResponse> {
        const response = await axiosInstance.post(`/restaurants/${restaurantId}/taxes`, data, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    }

    static async getTaxesByRestaurant(
        token: string,
        restaurantId: string,
        scope: 'restaurant' | 'branch' = 'restaurant',
        category?: string,
        page: number = 1,
        limit: number = 100
    ): Promise<TaxListResponse> {
        const params: any = { scope, page, limit };
        if (category) params.category = category;

        const response = await axiosInstance.get(`/restaurants/${restaurantId}/taxes`, {
            params,
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    }

    static async getTax(token: string, restaurantId: string, taxId: string): Promise<SingleTaxResponse> {
        const response = await axiosInstance.get(`/restaurants/${restaurantId}/taxes/${taxId}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    }

    static async updateTax(token: string, restaurantId: string, taxId: string, data: UpdateTaxDTO): Promise<SingleTaxResponse> {
        const response = await axiosInstance.put(`/restaurants/${restaurantId}/taxes/${taxId}`, data, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    }

    static async updateTaxStatus(token: string, restaurantId: string, taxId: string, isActive: boolean): Promise<SingleTaxResponse> {
        const response = await axiosInstance.patch(`/restaurants/${restaurantId}/taxes/${taxId}/status`, { isActive }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    }

    static async deleteTax(token: string, restaurantId: string, taxId: string): Promise<SingleTaxResponse> {
        const response = await axiosInstance.delete(`/restaurants/${restaurantId}/taxes/${taxId}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    }

    static async reorderTaxes(token: string, restaurantId: string, taxIds: string[]): Promise<{ success: boolean }> {
        const response = await axiosInstance.patch(`/restaurants/${restaurantId}/taxes/reorder`, { taxIds }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    }
}
