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
import { ITax } from '@/models/Tax.model';
import { CustomerSessionRepository } from '@/repositories/customersession.repository';

export class OrderService {
  private orderRepo: OrderRepository;
  private restaurantRepo: RestaurantRepository;
  private branchRepo: BranchRepository;
  private tableRepo: TableRepository;
  private menuItemRepo: MenuItemRepository;
  private taxRepo: TaxRepository;
  private sessionRepo: CustomerSessionRepository;

  constructor() {
    this.orderRepo = new OrderRepository();
    this.restaurantRepo = new RestaurantRepository();
    this.branchRepo = new BranchRepository();
    this.tableRepo = new TableRepository();
    this.menuItemRepo = new MenuItemRepository();
    this.taxRepo = new TaxRepository();
    this.sessionRepo = new CustomerSessionRepository();
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
    
    
    // Validate branch readiness (operating hours, acceptOrders flag)
    await this.validateBranchReadiness(branch);
    
    // Verify table exists
    const table = await this.tableRepo.findById(data.tableId);
    if (!table || !table.isActive) {
      throw new AppError('Table not found or inactive', 404);
    }

    // Verify table belongs to the branch
    if (table.branchId._id.toString() !== data.branchId) {
      throw new AppError('Table does not belong to this branch', 400);
    }

    // Validate items array is not empty
    if (!data.items || data.items.length === 0) {
      throw new AppError('Order must contain at least one item', 400);
    }
    
    // Validate table is available for new order
    await this.validateTableAvailability(data.tableId);

    // Process order items with correct branch pricing
    const processedItems = await Promise.all(
      data.items.map(async (item) => {
        // Validate quantity
        if (item.quantity <= 0) {
          throw new AppError('Item quantity must be greater than 0', 400);
        }

        // Fetch item with branch-specific pricing applied
        const menuItem = await this.menuItemRepo.findByIdForBranch(
          item.menuItemId,
          data.branchId
        );

        if (!menuItem) {
          throw new AppError(
            `Menu item ${item.menuItemId} not found or not available for this branch`,
            400
          );
        }

        // Check stock if availableQuantity is set
        if (menuItem.availableQuantity !== undefined && menuItem.availableQuantity < item.quantity) {
          throw new AppError(
            `Insufficient stock for ${menuItem.name}. Available: ${menuItem.availableQuantity}`,
            400
          );
        }

        // Use the price returned by findByIdForBranch (already has branch override applied)
        let itemPrice = menuItem.discountPrice || menuItem.price;
        let variant = undefined;

        // Handle variants
        if (item.variantName && menuItem.variants && menuItem.variants.length > 0) {
          const selectedVariant = menuItem.variants.find((v: any) => v.name === item.variantName);
          if (selectedVariant) {
            itemPrice = selectedVariant.price;
            variant = { name: selectedVariant.name, price: selectedVariant.price };
          } else {
            throw new AppError(
              `Variant "${item.variantName}" not found for item ${menuItem.name}`,
              400
            );
          }
        }

        // Validate and calculate addons
        const addons = item.addons || [];
        if (addons.length > 0) {
          for (const addon of addons) {
            const validAddon = menuItem.addons?.find((a: any) => a.name === addon.name);
            if (!validAddon) {
              throw new AppError(
                `Addon "${addon.name}" not found for item ${menuItem.name}`,
                400
              );
            }
            if (validAddon.price !== addon.price) {
              throw new AppError(
                `Invalid price for addon "${addon.name}"`,
                400
              );
            }
          }
        }

        const addonsTotal = addons.reduce((sum, addon) => sum + addon.price, 0);
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

    // Validate minimum order amount
    this.validateMinimumOrder(subtotal, branch.settings.minOrderAmount);

    // Get branch-configured taxes (from Phase 1 refactoring)
    let applicableTaxes: any[];

    if (branch.settings.taxIds && branch.settings.taxIds.length > 0) {
      applicableTaxes = await this.taxRepo.findByIds(
        branch.settings.taxIds.map((id: any) => id.toString())
      );
    } else {
      if (restaurant.defaultSettings.defaultTaxIds && restaurant.defaultSettings.defaultTaxIds.length > 0) {
        applicableTaxes = await this.taxRepo.findByIds(
          restaurant.defaultSettings.defaultTaxIds.map((id: any) => id.toString())
        );
      } else {
        applicableTaxes = [];
      }
    }

    // Filter taxes based on conditions
    const filteredTaxes = applicableTaxes.filter((tax) => {
      if (!tax.conditions) return true;

      if (
        tax.conditions.orderType &&
        tax.conditions.orderType.length > 0 &&
        !tax.conditions.orderType.includes(data.orderType)
      ) {
        return false;
      }

      if (tax.conditions.minOrderAmount && subtotal < tax.conditions.minOrderAmount) {
        return false;
      }

      if (tax.conditions.maxOrderAmount && subtotal > tax.conditions.maxOrderAmount) {
        return false;
      }

      return true;
    });

    // Calculate taxes
    let currentBase = subtotal;
    const taxes = [];
    let totalTaxAmount = 0;

    for (const tax of filteredTaxes) {
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

    // Create order
    const order = await this.orderRepo.create(orderData);

    // Update table status to occupied
    await this.tableRepo.updateStatus(data.tableId, 'occupied');

    // Link order to customer session if one exists
    const activeSession = await this.sessionRepo.findActiveSessionByTable(data.tableId);
    if (activeSession) {
      await this.sessionRepo.update(activeSession.sessionId, {
        activeOrderId: order._id,
        lastActivityTime: new Date(),
      });
    }

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

    // Validate status transition
    this.validateStatusTransition(order.status, status);

    // Special validation for completion
    if (status === 'completed') {
      if (order.paymentStatus !== 'paid') {
        throw new AppError('Cannot complete order: payment is not confirmed', 400);
      }
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
        // Reset table status to available
        await this.tableRepo.updateStatus(order.tableId.toString(), 'available');
        // End customer session if exists
        const session = await this.sessionRepo.findActiveSessionByTable(order.tableId.toString());
        if (session) {
          await this.sessionRepo.update(session.sessionId, {
            activeOrderId: undefined,
            endTime: new Date(),
            isActive: false,
          });
        }
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

    // Validate cancellation is allowed
    this.validateCancellation(order);

    const updatedOrder = await this.orderRepo.update(id, {
      status: 'cancelled',
      cancelledAt: new Date(),
      cancellationReason,
    });

    if (!updatedOrder) {
      throw new AppError('Failed to cancel order', 500);
    }

    // Reset table status to available
    await this.tableRepo.updateStatus(order.tableId.toString(), 'available');

    return updatedOrder;
  }

  /**
 * Validate branch is ready to accept orders
 */
  private async validateBranchReadiness(branch: any): Promise<void> {
    if (!branch.settings.acceptOrders) {
      throw new AppError('This branch is not currently accepting orders', 400);
    }

    // Check operating hours
    const now = new Date();
    const currentDay = now.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase() as
      'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

    const todayHours = branch.settings.operatingHours.find(
      (oh: any) => oh.day === currentDay
    );

    if (!todayHours || !todayHours.isOpen) {
      throw new AppError('Branch is closed today', 400);
    }

    // Check current time is within operating hours
    const currentTime = now.toTimeString().slice(0, 5); // HH:MM format
    // if (currentTime < todayHours.openTime || currentTime > todayHours.closeTime) {
    //   throw new AppError(
    //     `Branch is closed. Operating hours: ${todayHours.openTime} - ${todayHours.closeTime}`,
    //     400
    //   );
    // }
  }

  /**
   * Validate minimum order amount
   */
  private validateMinimumOrder(subtotal: number, minAmount: number): void {
    if (minAmount > 0 && subtotal < minAmount) {
      throw new AppError(
        `Minimum order amount is ${minAmount}. Current subtotal: ${subtotal}`,
        400
      );
    }
  }

  /**
 * Validate table is available for new order
 */
  private async validateTableAvailability(tableId: string): Promise<void> {
    // Use repository method instead of direct query
    const hasActiveOrder = await this.orderRepo.hasActiveOrders(tableId);

    if (hasActiveOrder) {
      throw new AppError('This table already has an active order', 400);
    }
  }

  /**
   * Validate status transition is allowed
   */
  private validateStatusTransition(
    currentStatus: IOrder['status'],
    newStatus: IOrder['status']
  ): void {
    const allowedTransitions: Record<IOrder['status'], IOrder['status'][]> = {
      pending: ['confirmed', 'cancelled'],
      confirmed: ['preparing', 'cancelled'],
      preparing: ['ready', 'cancelled'],
      ready: ['served', 'cancelled'],
      served: ['completed'],
      completed: [], // Cannot transition from completed
      cancelled: [], // Cannot transition from cancelled
    };

    const allowed = allowedTransitions[currentStatus] || [];

    if (!allowed.includes(newStatus)) {
      throw new AppError(
        `Cannot transition from ${currentStatus} to ${newStatus}`,
        400
      );
    }
  }

  /**
   * Validate order can be cancelled
   */
  private validateCancellation(order: IOrder): void {
    if (order.status === 'completed') {
      throw new AppError('Cannot cancel completed order', 400);
    }

    if (order.status === 'cancelled') {
      throw new AppError('Order is already cancelled', 400);
    }

    if (order.paymentStatus === 'paid') {
      throw new AppError(
        'Cannot cancel paid order. Please process refund first.',
        400
      );
    }
  }

  private async generateOrderNumber(branchId: string): Promise<string> {
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0].replace(/-/g, '');
    const count = await this.orderRepo.countTodayOrders(branchId);
    const sequence = String(count + 1).padStart(4, '0');
    return `ORD-${dateStr}-${sequence}`;
  }
}
