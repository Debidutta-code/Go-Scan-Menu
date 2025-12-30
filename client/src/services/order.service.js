import apiClient from '../lib/api';
export const orderService = {
    // Create order
    createOrder: async (restaurantId, data) => {
        const response = await apiClient.post(`/restaurants/${restaurantId}/orders`, data);
        return response.data.data;
    },
    // Get orders by branch
    getOrdersByBranch: async (restaurantId, branchId) => {
        const response = await apiClient.get(`/restaurants/${restaurantId}/orders/branch/${branchId}`);
        return response.data.data;
    },
    // Get order by ID
    getOrderById: async (restaurantId, orderId) => {
        const response = await apiClient.get(`/restaurants/${restaurantId}/orders/${orderId}`);
        return response.data.data;
    },
    // Get order by order number
    getOrderByNumber: async (restaurantId, orderNumber) => {
        const response = await apiClient.get(`/restaurants/${restaurantId}/orders/number/${orderNumber}`);
        return response.data.data;
    },
    // Update order status
    updateOrderStatus: async (restaurantId, orderId, data) => {
        const response = await apiClient.patch(`/restaurants/${restaurantId}/orders/${orderId}/status`, data);
        return response.data.data;
    },
    // Update payment status
    updatePaymentStatus: async (restaurantId, orderId, data) => {
        const response = await apiClient.patch(`/restaurants/${restaurantId}/orders/${orderId}/payment`, data);
        return response.data.data;
    },
    // Cancel order
    cancelOrder: async (restaurantId, orderId, reason) => {
        const response = await apiClient.patch(`/restaurants/${restaurantId}/orders/${orderId}/cancel`, { cancellationReason: reason });
        return response.data.data;
    },
};
