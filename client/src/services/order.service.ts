import { apiService } from './api.service';
import { API_ENDPOINTS } from '@/config/api.config';

export interface OrderItem {
  menuItemId: string;
  name: string;
  image?: string;
  quantity: number;
  price: number;
  variant?: {
    name: string;
    price: number;
  };
  addons: Array<{
    name: string;
    price: number;
  }>;
  customizations: Array<{
    name: string;
    value: string;
  }>;
  specialInstructions?: string;
  itemTotal: number;
}

export interface CreateOrderData {
  branchId: string;
  tableId: string;
  tableNumber: string;
  items: OrderItem[];
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  orderType: 'dine-in' | 'takeaway';
  specialInstructions?: string;
}

class OrderService {
  async createOrder(restaurantId: string, data: CreateOrderData) {
    return await apiService.post(
      API_ENDPOINTS.PUBLIC.ORDER,
      {
        restaurantId,
        ...data,
      }
    );
  }

  async getOrderByNumber(orderNumber: string) {
    return await apiService.get(`/orders/by-number/${orderNumber}`);
  }

  async getOrdersByBranch(restaurantId: string, branchId: string, params?: any) {
    return await apiService.get(
      `${API_ENDPOINTS.ORDERS(restaurantId)}/branch/${branchId}`,
      params
    );
  }

  async getOrderById(restaurantId: string, orderId: string) {
    return await apiService.get(`${API_ENDPOINTS.ORDERS(restaurantId)}/${orderId}`);
  }

  async updateOrderStatus(restaurantId: string, orderId: string, status: string) {
    return await apiService.patch(
      `${API_ENDPOINTS.ORDERS(restaurantId)}/${orderId}/status`,
      { status }
    );
  }

  async updatePaymentStatus(
    restaurantId: string,
    orderId: string,
    paymentStatus: string,
    paymentMethod?: string
  ) {
    return await apiService.patch(
      `${API_ENDPOINTS.ORDERS(restaurantId)}/${orderId}/payment`,
      { paymentStatus, paymentMethod }
    );
  }

  async updateItemStatus(
    restaurantId: string,
    orderId: string,
    itemId: string,
    status: string
  ) {
    return await apiService.patch(
      `${API_ENDPOINTS.ORDERS(restaurantId)}/${orderId}/items/${itemId}/status`,
      { status }
    );
  }

  async assignStaff(restaurantId: string, orderId: string, staffId: string, staffName: string) {
    return await apiService.patch(
      `${API_ENDPOINTS.ORDERS(restaurantId)}/${orderId}/assign-staff`,
      { staffId, staffName }
    );
  }

  async cancelOrder(restaurantId: string, orderId: string, cancellationReason?: string) {
    return await apiService.patch(
      `${API_ENDPOINTS.ORDERS(restaurantId)}/${orderId}/cancel`,
      { cancellationReason }
    );
  }
}

export const orderService = new OrderService();
export default orderService;
