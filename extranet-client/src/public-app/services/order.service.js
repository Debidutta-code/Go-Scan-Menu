// src/public-app/services/order.service.ts
import env from '@/shared/config/env';
import axios, { AxiosError } from 'axios';
const API_BASE_URL = env.API_BASE_URL || 'http://localhost:5000/api/v1';
export class PublicOrderService {
    /**
     * Create a new order (public access, no auth required)
     */
    static async createOrder(restaurantId, data) {
        try {
            const response = await axios.post(`${API_BASE_URL}/public/orders/${restaurantId}`, data);
            return {
                success: true,
                data: response.data.data,
                message: response.data.message,
            };
        }
        catch (error) {
            if (error instanceof AxiosError) {
                return {
                    success: false,
                    error: error.response?.data?.message || 'Failed to place order',
                };
            }
            return {
                success: false,
                error: 'An unexpected error occurred',
            };
        }
    }
    /**
     * Get orders for a table (public access)
     */
    static async getOrdersByTable(tableId) {
        try {
            const response = await axios.get(`${API_BASE_URL}/public/orders/table/${tableId}`);
            return {
                success: true,
                data: response.data.data,
                message: response.data.message,
            };
        }
        catch (error) {
            if (error instanceof AxiosError) {
                return {
                    success: false,
                    error: error.response?.data?.message || 'Failed to fetch orders',
                };
            }
            return {
                success: false,
                error: 'An unexpected error occurred',
            };
        }
    }
}
