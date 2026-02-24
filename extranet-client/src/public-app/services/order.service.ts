// src/public-app/services/order.service.ts
import env from '@/config/env';
import axios, { AxiosError } from 'axios';

const API_BASE_URL = env.API_BASE_URL || 'http://localhost:5000/api/v1';

interface ApiResponse<T = any> {
    success: boolean;
    message?: string;
    data?: T;
    error?: string;
}

export interface OrderItem {
    menuItemId: string;
    quantity: number;
    variantName?: string;
    addons?: Array<{ name: string; price: number }>;
    customizations?: Array<{ name: string; value: string }>;
    specialInstructions?: string;
}

export interface CreateOrderData {
    branchId: string;
    tableId: string;
    customerName?: string;
    customerPhone?: string;
    customerEmail?: string;
    items: OrderItem[];
    orderType: 'dine-in' | 'takeaway';
    specialInstructions?: string;
}

export class PublicOrderService {
    /**
     * Create a new order (public access, no auth required)
     */
    static async createOrder(
        restaurantId: string,
        data: CreateOrderData
    ): Promise<ApiResponse> {
        try {
            const response = await axios.post(
                `${API_BASE_URL}/public/orders/${restaurantId}`,
                data
            );
            return {
                success: true,
                data: response.data.data,
                message: response.data.message,
            };
        } catch (error) {
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
}
