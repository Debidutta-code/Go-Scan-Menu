// src/services/order.service.ts

import axiosInstance from '@/shared/services/axios.service';
import { ApiResponse } from '@/shared/types';

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

export interface IKOT {
    _id: string;
    kotNumber: string;
    orderNumber: string;
    tableNumber: string;
    customerName?: string;
    items: Array<{
        name: string;
        quantity: number;
        variant?: { name: string };
        addons: Array<{ name: string }>;
        customizations: Array<{ name: string; value: string }>;
        specialInstructions?: string;
    }>;
    orderType: string;
    orderTime: string;
    createdAt: string;
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
    private static getHeaders(token: string) {
        return {
            Authorization: `Bearer ${token}`,
        };
    }

    static async getBranchOrdersFull(
        token: string,
        restaurantId: string,
        branchId: string,
        filters: {
            status?: string;
            orderType?: string;
            paymentStatus?: string;
            sortBy?: 'totalAmount' | 'itemCount' | 'orderTime';
            sortOrder?: 'asc' | 'desc';
        } = {},
        page: number = 1,
        limit: number = 20
    ): Promise<ApiResponse<IOrderListResponse>> {
        try {
            const queryParams = new URLSearchParams();
            if (filters.status) queryParams.append('status', filters.status);
            if (filters.orderType) queryParams.append('orderType', filters.orderType);
            if (filters.paymentStatus) queryParams.append('paymentStatus', filters.paymentStatus);
            if (filters.sortBy) queryParams.append('sortBy', filters.sortBy);
            if (filters.sortOrder) queryParams.append('sortOrder', filters.sortOrder);
            queryParams.append('page', page.toString());
            queryParams.append('limit', limit.toString());

            const response = await axiosInstance.get(
                `/restaurants/${restaurantId}/orders/branch/${branchId}/full?${queryParams.toString()}`,
                { headers: this.getHeaders(token) }
            );
            return response.data;
        } catch (error: any) {
            const message = error.response?.data?.message || error.message || 'Failed to fetch orders';
            throw new Error(message);
        }
    }

    static async updateOrderStatus(
        token: string,
        restaurantId: string,
        orderId: string,
        status: string
    ): Promise<ApiResponse<IOrder>> {
        try {
            const response = await axiosInstance.patch(
                `/restaurants/${restaurantId}/orders/${orderId}/status`,
                { status },
                { headers: this.getHeaders(token) }
            );
            return response.data;
        } catch (error: any) {
            const message = error.response?.data?.message || error.message || 'Failed to update status';
            throw new Error(message);
        }
    }

    static async cancelOrder(
        token: string,
        restaurantId: string,
        orderId: string,
        cancellationReason?: string
    ): Promise<ApiResponse<IOrder>> {
        try {
            const response = await axiosInstance.patch(
                `/restaurants/${restaurantId}/orders/${orderId}/cancel`,
                { cancellationReason },
                { headers: this.getHeaders(token) }
            );
            return response.data;
        } catch (error: any) {
            const message = error.response?.data?.message || error.message || 'Failed to cancel order';
            throw new Error(message);
        }
    }

    static async updatePaymentStatus(
        token: string,
        restaurantId: string,
        orderId: string,
        paymentStatus: string,
        paymentMethod?: string
    ): Promise<ApiResponse<IOrder>> {
        try {
            const response = await axiosInstance.patch(
                `/restaurants/${restaurantId}/orders/${orderId}/payment`,
                { paymentStatus, paymentMethod },
                { headers: this.getHeaders(token) }
            );
            return response.data;
        } catch (error: any) {
            const message = error.response?.data?.message || error.message || 'Failed to update payment status';
            throw new Error(message);
        }
    }

    static async getKOT(
        token: string,
        restaurantId: string,
        orderId: string
    ): Promise<ApiResponse<IKOT>> {
        try {
            const response = await axiosInstance.get(
                `/restaurants/${restaurantId}/orders/${orderId}/kot`,
                { headers: this.getHeaders(token) }
            );
            return response.data;
        } catch (error: any) {
            const message = error.response?.data?.message || error.message || 'Failed to fetch KOT';
            throw new Error(message);
        }
    }
}

export class PublicOrderService {
    static async createOrder(restaurantSlug: string, branchCode: string, payload: any): Promise<ApiResponse<IOrder>> {
        try {
            const response = await axiosInstance.post(`/public/orders/${restaurantSlug}/${branchCode}`, payload);
            return response.data;
        } catch (error: any) {
            const message = error.response?.data?.message || error.message || 'Failed to create order';
            throw new Error(message);
        }
    }

    static async getOrder(restaurantSlug: string, branchCode: string, orderId: string): Promise<ApiResponse<IOrder>> {
        try {
            const response = await axiosInstance.get(`/public/orders/${restaurantSlug}/${branchCode}/${orderId}`);
            return response.data;
        } catch (error: any) {
            const message = error.response?.data?.message || error.message || 'Failed to fetch order';
            throw new Error(message);
        }
    }

    static async getCustomerOrders(restaurantSlug: string, branchCode: string, phone: string): Promise<ApiResponse<IOrder[]>> {
        try {
            const response = await axiosInstance.get(`/public/orders/${restaurantSlug}/${branchCode}/customer/${phone}`);
            return response.data;
        } catch (error: any) {
            const message = error.response?.data?.message || error.message || 'Failed to fetch customer orders';
            throw new Error(message);
        }
    }

    static async getOrdersByTable(restaurantSlug: string, branchCode: string, tableId: string): Promise<ApiResponse<IOrder[]>> {
        try {
            const response = await axiosInstance.get(`/public/orders/${restaurantSlug}/${branchCode}/table/${tableId}`);
            return response.data;
        } catch (error: any) {
            const message = error.response?.data?.message || error.message || 'Failed to fetch table orders';
            throw new Error(message);
        }
    }
}
