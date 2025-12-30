import apiClient from '../lib/api';
import type {
  Order,
  CreateOrderRequest,
  UpdateOrderStatusRequest,
  UpdatePaymentStatusRequest,
} from '../types/order.types';
import type { ApiResponse } from '../types/api.types';

export const orderService = {
  // Create order
  createOrder: async (restaurantId: string, data: CreateOrderRequest): Promise<Order> => {
    const response = await apiClient.post<ApiResponse<Order>>(
      `/restaurants/${restaurantId}/orders`,
      data
    );
    return response.data.data;
  },

  // Get orders by branch
  getOrdersByBranch: async (restaurantId: string, branchId: string): Promise<Order[]> => {
    const response = await apiClient.get<ApiResponse<Order[]>>(
      `/restaurants/${restaurantId}/orders/branch/${branchId}`
    );
    return response.data.data;
  },

  // Get order by ID
  getOrderById: async (restaurantId: string, orderId: string): Promise<Order> => {
    const response = await apiClient.get<ApiResponse<Order>>(
      `/restaurants/${restaurantId}/orders/${orderId}`
    );
    return response.data.data;
  },

  // Get order by order number
  getOrderByNumber: async (restaurantId: string, orderNumber: string): Promise<Order> => {
    const response = await apiClient.get<ApiResponse<Order>>(
      `/restaurants/${restaurantId}/orders/number/${orderNumber}`
    );
    return response.data.data;
  },

  // Update order status
  updateOrderStatus: async (
    restaurantId: string,
    orderId: string,
    data: UpdateOrderStatusRequest
  ): Promise<Order> => {
    const response = await apiClient.patch<ApiResponse<Order>>(
      `/restaurants/${restaurantId}/orders/${orderId}/status`,
      data
    );
    return response.data.data;
  },

  // Update payment status
  updatePaymentStatus: async (
    restaurantId: string,
    orderId: string,
    data: UpdatePaymentStatusRequest
  ): Promise<Order> => {
    const response = await apiClient.patch<ApiResponse<Order>>(
      `/restaurants/${restaurantId}/orders/${orderId}/payment`,
      data
    );
    return response.data.data;
  },

  // Cancel order
  cancelOrder: async (restaurantId: string, orderId: string, reason: string): Promise<Order> => {
    const response = await apiClient.patch<ApiResponse<Order>>(
      `/restaurants/${restaurantId}/orders/${orderId}/cancel`,
      { cancellationReason: reason }
    );
    return response.data.data;
  },
};
