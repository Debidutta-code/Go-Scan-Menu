// src/services/order.service.ts
import axiosInstance from '@/shared/services/axios.service';
export class OrderService {
    static getHeaders(token) {
        return {
            Authorization: `Bearer ${token}`,
        };
    }
    static async getBranchOrdersFull(token, restaurantId, branchId, filters = {}, page = 1, limit = 20) {
        try {
            const queryParams = new URLSearchParams();
            if (filters.status)
                queryParams.append('status', filters.status);
            if (filters.orderType)
                queryParams.append('orderType', filters.orderType);
            if (filters.paymentStatus)
                queryParams.append('paymentStatus', filters.paymentStatus);
            if (filters.sortBy)
                queryParams.append('sortBy', filters.sortBy);
            if (filters.sortOrder)
                queryParams.append('sortOrder', filters.sortOrder);
            queryParams.append('page', page.toString());
            queryParams.append('limit', limit.toString());
            const response = await axiosInstance.get(`/restaurants/${restaurantId}/orders/branch/${branchId}/full?${queryParams.toString()}`, { headers: this.getHeaders(token) });
            return response.data;
        }
        catch (error) {
            const message = error.response?.data?.message || error.message || 'Failed to fetch orders';
            throw new Error(message);
        }
    }
    static async updateOrderStatus(token, restaurantId, orderId, status) {
        try {
            const response = await axiosInstance.patch(`/restaurants/${restaurantId}/orders/${orderId}/status`, { status }, { headers: this.getHeaders(token) });
            return response.data;
        }
        catch (error) {
            const message = error.response?.data?.message || error.message || 'Failed to update status';
            throw new Error(message);
        }
    }
    static async cancelOrder(token, restaurantId, orderId, cancellationReason) {
        try {
            const response = await axiosInstance.patch(`/restaurants/${restaurantId}/orders/${orderId}/cancel`, { cancellationReason }, { headers: this.getHeaders(token) });
            return response.data;
        }
        catch (error) {
            const message = error.response?.data?.message || error.message || 'Failed to cancel order';
            throw new Error(message);
        }
    }
    static async updatePaymentStatus(token, restaurantId, orderId, paymentStatus, paymentMethod) {
        try {
            const response = await axiosInstance.patch(`/restaurants/${restaurantId}/orders/${orderId}/payment`, { paymentStatus, paymentMethod }, { headers: this.getHeaders(token) });
            return response.data;
        }
        catch (error) {
            const message = error.response?.data?.message || error.message || 'Failed to update payment status';
            throw new Error(message);
        }
    }
}
export class PublicOrderService {
    static async createOrder(restaurantSlug, branchCode, payload) {
        try {
            const response = await axiosInstance.post(`/public/orders/${restaurantSlug}/${branchCode}`, payload);
            return response.data;
        }
        catch (error) {
            const message = error.response?.data?.message || error.message || 'Failed to create order';
            throw new Error(message);
        }
    }
    static async getOrder(restaurantSlug, branchCode, orderId) {
        try {
            const response = await axiosInstance.get(`/public/orders/${restaurantSlug}/${branchCode}/${orderId}`);
            return response.data;
        }
        catch (error) {
            const message = error.response?.data?.message || error.message || 'Failed to fetch order';
            throw new Error(message);
        }
    }
    static async getCustomerOrders(restaurantSlug, branchCode, phone) {
        try {
            const response = await axiosInstance.get(`/public/orders/${restaurantSlug}/${branchCode}/customer/${phone}`);
            return response.data;
        }
        catch (error) {
            const message = error.response?.data?.message || error.message || 'Failed to fetch customer orders';
            throw new Error(message);
        }
    }
    static async getOrdersByTable(restaurantSlug, branchCode, tableId) {
        try {
            const response = await axiosInstance.get(`/public/orders/${restaurantSlug}/${branchCode}/table/${tableId}`);
            return response.data;
        }
        catch (error) {
            const message = error.response?.data?.message || error.message || 'Failed to fetch table orders';
            throw new Error(message);
        }
    }
}
