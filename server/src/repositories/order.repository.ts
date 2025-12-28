// src/repositories/order.repository.ts
import { Order, IOrder } from '@/models/Order.model';
import { Types } from 'mongoose';

export class OrderRepository {
  async create(data: Partial<IOrder>): Promise<IOrder> {
    const order = await Order.create(data);
    return order;
  }

  async findById(id: string): Promise<IOrder | null> {
    return Order.findById(id)
      .populate('restaurantId')
      .populate('branchId')
      .populate('tableId')
      .populate('assignedStaffId')
      .populate('items.menuItemId')
      .populate('taxes.taxId');
  }

  async findByOrderNumber(orderNumber: string): Promise<IOrder | null> {
    return Order.findOne({ orderNumber })
      .populate('restaurantId')
      .populate('branchId')
      .populate('tableId')
      .populate('assignedStaffId')
      .populate('items.menuItemId')
      .populate('taxes.taxId');
  }

  async findByBranch(
    branchId: string,
    filter: { status?: string; orderType?: string; paymentStatus?: string } = {},
    page: number = 1,
    limit: number = 20
  ) {
    const skip = (page - 1) * limit;
    const query: any = { branchId };

    if (filter.status) query.status = filter.status;
    if (filter.orderType) query.orderType = filter.orderType;
    if (filter.paymentStatus) query.paymentStatus = filter.paymentStatus;

    const [orders, total] = await Promise.all([
      Order.find(query)
        .populate('tableId')
        .populate('assignedStaffId')
        .skip(skip)
        .limit(limit)
        .sort({ orderTime: -1 }),
      Order.countDocuments(query),
    ]);

    return {
      orders,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findByTable(tableId: string, status?: string, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;
    const query: any = { tableId };

    if (status) query.status = status;

    const [orders, total] = await Promise.all([
      Order.find(query)
        .populate('branchId')
        .populate('assignedStaffId')
        .skip(skip)
        .limit(limit)
        .sort({ orderTime: -1 }),
      Order.countDocuments(query),
    ]);

    return {
      orders,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async update(id: string, data: Partial<IOrder>): Promise<IOrder | null> {
    return Order.findByIdAndUpdate(id, data, { new: true })
      .populate('restaurantId')
      .populate('branchId')
      .populate('tableId')
      .populate('assignedStaffId')
      .populate('items.menuItemId')
      .populate('taxes.taxId');
  }

  async updateItemStatus(
    orderId: string,
    itemId: string,
    status: 'pending' | 'preparing' | 'prepared' | 'served'
  ): Promise<IOrder | null> {
    return Order.findOneAndUpdate(
      { _id: orderId, 'items._id': itemId },
      { $set: { 'items.$.status': status } },
      { new: true }
    )
      .populate('restaurantId')
      .populate('branchId')
      .populate('tableId')
      .populate('assignedStaffId')
      .populate('items.menuItemId')
      .populate('taxes.taxId');
  }

  async countTodayOrders(branchId: string): Promise<number> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return Order.countDocuments({
      branchId,
      orderTime: { $gte: today },
    });
  }

  async delete(id: string): Promise<IOrder | null> {
    return Order.findByIdAndDelete(id);
  }

  /**
 * Find active orders for a table (not completed or cancelled)
 */
  async findActiveOrdersByTable(tableId: string): Promise<IOrder[]> {
    return Order.find({
      tableId,
      status: { $nin: ['completed', 'cancelled'] }
    })
      .populate('branchId')
      .populate('assignedStaffId')
      .sort({ orderTime: -1 });
  }

  /**
   * Count orders by status for a branch (for analytics later)
   */
  async countByBranchAndStatus(
    branchId: string,
    status: IOrder['status'],
    startDate?: Date,
    endDate?: Date
  ): Promise<number> {
    const query: any = { branchId, status };

    if (startDate || endDate) {
      query.orderTime = {};
      if (startDate) query.orderTime.$gte = startDate;
      if (endDate) query.orderTime.$lte = endDate;
    }

    return Order.countDocuments(query);
  }

  /**
   * Check if table has any active orders
   */
  async hasActiveOrders(tableId: string): Promise<boolean> {
    const count = await Order.countDocuments({
      tableId,
      status: { $nin: ['completed', 'cancelled'] }
    });
    return count > 0;
  }
}
