// Order Types
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
  status: 'pending' | 'preparing' | 'prepared' | 'served';
}

export interface OrderTax {
  taxId: string;
  name: string;
  taxType: 'percentage' | 'fixed';
  value: number;
  calculatedAmount: number;
  applicableOn: 'subtotal' | 'item_total' | 'after_other_taxes';
  category: 'food_tax' | 'service_tax' | 'room_tax' | 'luxury_tax' | 'other';
  groupName?: string;
}

export interface Order {
  _id: string;
  restaurantId: string;
  branchId: string;
  tableId: string;
  tableNumber: string;
  orderNumber: string;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  items: OrderItem[];
  subtotal: number;
  taxes: OrderTax[];
  totalTaxAmount: number;
  serviceChargeAmount: number;
  serviceChargePercentage: number;
  discountAmount: number;
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'served' | 'completed' | 'cancelled';
  orderType: 'dine-in' | 'takeaway';
  paymentStatus: 'pending' | 'paid' | 'failed';
  paymentMethod?: 'cash' | 'card' | 'upi' | 'wallet' | 'online';
  specialInstructions?: string;
  assignedStaffId?: string;
  assignedStaffName?: string;
  orderTime: string;
  confirmedAt?: string;
  preparingAt?: string;
  readyAt?: string;
  servedAt?: string;
  completedAt?: string;
  cancelledAt?: string;
  cancellationReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderRequest {
  branchId: string;
  tableId: string;
  tableNumber: string;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  items: Omit<OrderItem, 'status'>[];
  orderType: 'dine-in' | 'takeaway';
  specialInstructions?: string;
}

export interface UpdateOrderStatusRequest {
  status: Order['status'];
}

export interface UpdatePaymentStatusRequest {
  paymentStatus: Order['paymentStatus'];
  paymentMethod?: Order['paymentMethod'];
}
