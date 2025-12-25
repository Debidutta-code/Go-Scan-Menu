// src/services/order.service.ts
import { OrderRepository } from '@/repositories/order.repository';
import { RestaurantRepository } from '@/repositories/restaurant.repository';
import { BranchRepository } from '@/repositories/branch.repository';
import { TableRepository } from '@/repositories/table.repository';
import { MenuItemRepository } from '@/repositories/menuitem.repository';
import { TaxRepository } from '@/repositories/tax.repository';
import { IOrder } from '@/models/Order.model';
import { AppError } from '@/utils/AppError';
import { Types } from 'mongoose';

export class OrderService {
  private orderRepo: OrderRepository;
  private restaurantRepo: RestaurantRepository;
  private branchRepo: BranchRepository;
  private tableRepo: TableRepository;
  private menuItemRepo: MenuItemRepository;
  private taxRepo: TaxRepository;

  constructor() {
    this.orderRepo = new OrderRepository();
    this.restaurantRepo = new RestaurantRepository();
    this.branchRepo = new BranchRepository();
    this.tableRepo = new TableRepository();
    this.menuItemRepo = new MenuItemRepository();
    this.taxRepo = new TaxRepository();
  }

  async createOrder(
    restaurantId: string,
    data: {
      branchId: string;
      tableId: string;
      customerName?: string;
      customerPhone?: string;
      customerEmail?: string;
      items: Array<{
        menuItemId: string;
        quantity: number;
        variantName?: string;
        addons?: Array<{ name: string; price: number }>;
        customizations?: Array<{ name: string; value: string }>;
        specialInstructions?: string;
      }>;
      orderType: 'dine-in' | 'takeaway';
      specialInstructions?: string;
    }
  ) {
    // Verify restaurant exists
    const restaurant = await this.restaurantRepo.findById(restaurantId);
    if (!restaurant || !restaurant.isActive) {
      throw new AppError('Restaurant not found or inactive', 404);
    }

    // Verify branch exists
    const branch = await this.branchRepo.findByIdAndRestaurant(data.branchId, restaurantId);
    if (!branch || !branch.isActive) {
      throw new AppError('Branch not found or inactive', 404);
    }

    // Verify table exists
    const table = await this.tableRepo.findById(data.tableId);
    if (!table || !table.isActive) {
      throw new AppError('Table not found or inactive', 404);
    }

    // Process order items
    const processedItems = await Promise.all(
      data.items.map(async (item) => {
        const menuItem = await this.menuItemRepo.findById(item.menuItemId);
        if (!menuItem || !menuItem.isActive || !menuItem.isAvailable) {
          throw new AppError(`Menu item ${item.menuItemId} not available`, 400);
        }

        let itemPrice = menuItem.price;
        let variant = undefined;

        // Handle variants
        if (item.variantName && menuItem.variants && menuItem.variants.length > 0) {
          const selectedVariant = menuItem.variants.find((v) => v.name === item.variantName);
          if (selectedVariant) {
            itemPrice = selectedVariant.price;
            variant = { name: selectedVariant.name, price: selectedVariant.price };
          }
        }

        // Calculate addons total
        const addons = item.addons || [];
        const addonsTotal = addons.reduce((sum, addon) => sum + addon.price, 0);

        // Calculate item total
        const itemTotal = (itemPrice + addonsTotal) * item.quantity;

        return {
          menuItemId: new Types.ObjectId(item.menuItemId),
          name: menuItem.name,
          image: menuItem.image,
          quantity: item.quantity,
          price: itemPrice,
          variant,
          addons,
          customizations: item.customizations || [],
          specialInstructions: item.specialInstructions,
          itemTotal,
          status: 'pending' as const,
        };
      })
    );

    // Calculate subtotal
    const subtotal = processedItems.reduce((sum, item) => sum + item.itemTotal, 0);

    // Get applicable taxes
    const applicableTaxes = await this.taxRepo.findApplicableTaxes(restaurantId, data.branchId);

    // Calculate taxes
    let currentBase = subtotal;
    const taxes = [];
    let totalTaxAmount = 0;

    for (const tax of applicableTaxes) {
      // Check conditions
      if (tax.conditions) {
        if (
          tax.conditions.orderType &&
          tax.conditions.orderType.length > 0 &&
          !tax.conditions.orderType.includes(data.orderType)
        ) {
          continue;
        }

        if (tax.conditions.minOrderAmount && subtotal < tax.conditions.minOrderAmount) {
          continue;
        }

        if (tax.conditions.maxOrderAmount && subtotal > tax.conditions.maxOrderAmount) {
          continue;
        }
      }

      let taxBase = currentBase;
      if (tax.applicableOn === 'subtotal') {
        taxBase = subtotal;
      } else if (tax.applicableOn === 'item_total') {
        taxBase = subtotal;
      }

      let calculatedAmount = 0;
      if (tax.taxType === 'percentage') {
        calculatedAmount = (taxBase * tax.value) / 100;
      } else {
        calculatedAmount = tax.value;
      }

      taxes.push({
        taxId: tax._id,
        name: tax.name,
        taxType: tax.taxType,
        value: tax.value,
        calculatedAmount,
        applicableOn: tax.applicableOn,
        category: tax.category,
        groupName: tax.groupName,
      });

      totalTaxAmount += calculatedAmount;

      if (tax.applicableOn === 'after_other_taxes') {
        currentBase += calculatedAmount;
      }
    }

    // Calculate service charge
    const serviceChargePercentage = branch.settings.serviceChargePercentage || 0;
    const serviceChargeAmount = (subtotal * serviceChargePercentage) / 100;

    // Calculate total
    const totalAmount = subtotal + totalTaxAmount + serviceChargeAmount;

    // Generate order number
    const orderNumber = await this.generateOrderNumber(data.branchId);

    const orderData: Partial<IOrder> = {
      restaurantId: new Types.ObjectId(restaurantId),
      branchId: new Types.ObjectId(data.branchId),
      tableId: new Types.ObjectId(data.tableId),
      tableNumber: table.tableNumber,
      orderNumber,
      customerName: data.customerName,
      customerPhone: data.customerPhone,
      customerEmail: data.customerEmail,
      items: processedItems,
      subtotal,
      taxes,
      totalTaxAmount,
      serviceChargeAmount,
      serviceChargePercentage,
      discountAmount: 0,
      totalAmount,
      status: 'pending',
      orderType: data.orderType,
      paymentStatus: 'pending',
      specialInstructions: data.specialInstructions,
      orderTime: new Date(),
    };

    const order = await this.orderRepo.create(orderData);
    return order;
  }

  async getOrder(id: string): Promise<IOrder> {
    const order = await this.orderRepo.findById(id);
    if (!order) {
      throw new AppError('Order not found', 404);
    }
    return order;
  }

  async getOrderByNumber(orderNumber: string): Promise<IOrder> {
    const order = await this.orderRepo.findByOrderNumber(orderNumber);
    if (!order) {
      throw new AppError('Order not found', 404);
    }
    return order;
  }

  async getOrdersByBranch(
    branchId: string,
    filter: { status?: string; orderType?: string; paymentStatus?: string },
    page: number = 1,
    limit: number = 20
  ) {
    return this.orderRepo.findByBranch(branchId, filter, page, limit);
  }
  async getOrdersByTable(tableId: string, status?: string, page: number = 1, limit: number = 20) {
    return this.orderRepo.findByTable(tableId, status, page, limit);
  }
  async updateOrderStatus(id: string, status: IOrder['status']): Promise<IOrder> {
    const order = await this.orderRepo.findById(id);
    if (!order) {
      throw new AppError('Order not found', 404);
    }
    const updateData: any = { status };

    // Set timestamps based on status
    switch (status) {
      case 'confirmed':
        updateData.confirmedAt = new Date();
        break;
      case 'preparing':
        updateData.preparingAt = new Date();
        break;
      case 'ready':
        updateData.readyAt = new Date();
        break;
      case 'served':
        updateData.servedAt = new Date();
        break;
      case 'completed':
        updateData.completedAt = new Date();
        break;
    }

    const updatedOrder = await this.orderRepo.update(id, updateData);
    if (!updatedOrder) {
      throw new AppError('Failed to update order status', 500);
    }

    return updatedOrder;
  }
  async updateItemStatus(
    orderId: string,
    itemId: string,
    status: 'pending' | 'preparing' | 'prepared' | 'served'
  ): Promise<IOrder> {
    const order = await this.orderRepo.findById(orderId);
    if (!order) {
      throw new AppError('Order not found', 404);
    }
    const updatedOrder = await this.orderRepo.updateItemStatus(orderId, itemId, status);
    if (!updatedOrder) {
      throw new AppError('Failed to update item status', 500);
    }

    return updatedOrder;
  }
  async updatePaymentStatus(
    id: string,
    paymentStatus: IOrder['paymentStatus'],
    paymentMethod?: IOrder['paymentMethod']
  ): Promise<IOrder> {
    const order = await this.orderRepo.findById(id);
    if (!order) {
      throw new AppError('Order not found', 404);
    }
    const updateData: any = { paymentStatus };
    if (paymentMethod) {
      updateData.paymentMethod = paymentMethod;
    }

    const updatedOrder = await this.orderRepo.update(id, updateData);
    if (!updatedOrder) {
      throw new AppError('Failed to update payment status', 500);
    }

    return updatedOrder;
  }
  async assignStaff(id: string, staffId: string, staffName: string): Promise<IOrder> {
    const order = await this.orderRepo.findById(id);
    if (!order) {
      throw new AppError('Order not found', 404);
    }
    const updatedOrder = await this.orderRepo.update(id, {
      assignedStaffId: new Types.ObjectId(staffId),
      assignedStaffName: staffName,
    });

    if (!updatedOrder) {
      throw new AppError('Failed to assign staff', 500);
    }

    return updatedOrder;
  }
  async cancelOrder(id: string, cancellationReason?: string): Promise<IOrder> {
    const order = await this.orderRepo.findById(id);
    if (!order) {
      throw new AppError('Order not found', 404);
    }
    if (order.status === 'completed' || order.status === 'cancelled') {
      throw new AppError('Cannot cancel completed or already cancelled order', 400);
    }

    const updatedOrder = await this.orderRepo.update(id, {
      status: 'cancelled',
      cancelledAt: new Date(),
      cancellationReason,
    });

    if (!updatedOrder) {
      throw new AppError('Failed to cancel order', 500);
    }

    return updatedOrder;
  }
  private async generateOrderNumber(branchId: string): Promise<string> {
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0].replace(/-/g, '');
    const count = await this.orderRepo.countTodayOrders(branchId);
    const sequence = String(count + 1).padStart(4, '0');
    return `ORD-${dateStr}-${sequence}`;
  }
}
