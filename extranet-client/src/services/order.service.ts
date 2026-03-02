// src/services/order.service.ts

import { ApiService } from './api.service';
import { ApiResponse } from '../types';

export interface IOrderItem {
    _id: string;
    menuItemId: any;
    name: string;
    image?: string;
    quantity: number;
    price: number;
    variant?: { name: string; price: number };
    addons?: Array<{ name: string; price: number }>;
    customizations?: Array<{ name: string; value: string }>;
    specialInstructions?: string;
    itemTotal: number;
    status: 'pending' | 'preparing' | 'prepared' | 'served';
}

export interface ITaxEntry {
    taxId: any;
    name: string;
    taxType: 'percentage' | 'fixed';
    value: number;
    calculatedAmount: number;
    applicableOn: string;
}

export interface IOrder {
    _id: string;
    orderNumber: string;
    restaurantId: any;
    branchId: any;
    tableId: any;
    tableNumber: string;
    customerName?: string;
    customerPhone?: string;
    items: IOrderItem[];
    subtotal: number;
    taxes: ITaxEntry[];
    totalTaxAmount: number;
    serviceChargeAmount: number;
    totalAmount: number;
    status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'served' | 'completed' | 'cancelled';
    orderType: 'dine-in' | 'takeaway';
    paymentStatus: 'pending' | 'paid' | 'failed';
    paymentMethod?: string;
    orderTime: string;
    confirmedAt?: string;
    completedAt?: string;
}

export interface IOrderListResponse {
    orders: IOrder[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

export class OrderService {
    static async getBranchOrdersFull(
        token: string,
        restaurantId: string,
        branchId: string,
        filters: { status?: string; orderType?: string; paymentStatus?: string } = {},
        page: number = 1,
        limit: number = 20
    ): Promise<ApiResponse<IOrderListResponse>> {
        const queryParams = new URLSearchParams();
        if (filters.status) queryParams.append('status', filters.status);
        if (filters.orderType) queryParams.append('orderType', filters.orderType);
        if (filters.paymentStatus) queryParams.append('paymentStatus', filters.paymentStatus);
        queryParams.append('page', page.toString());
        queryParams.append('limit', limit.toString());

        return ApiService.request<IOrderListResponse>(
            `/restaurants/${restaurantId}/orders/branch/${branchId}/full?${queryParams.toString()}`,
            { method: 'GET' },
            token
        );
    }

    static async updateOrderStatus(
        token: string,
        restaurantId: string,
        orderId: string,
        status: string
    ): Promise<ApiResponse<IOrder>> {
        return ApiService.request<IOrder>(
            `/restaurants/${restaurantId}/orders/${orderId}/status`,
            {
                method: 'PATCH',
                body: JSON.stringify({ status }),
            },
            token
        );
    }

    static async updatePaymentStatus(
        token: string,
        restaurantId: string,
        orderId: string,
        paymentStatus: string,
        paymentMethod?: string
    ): Promise<ApiResponse<IOrder>> {
        return ApiService.request<IOrder>(
            `/restaurants/${restaurantId}/orders/${orderId}/payment`,
            {
                method: 'PATCH',
                body: JSON.stringify({ paymentStatus, paymentMethod }),
            },
            token
        );
    }
}
