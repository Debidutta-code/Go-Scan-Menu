// src/repositories/order.repository.ts
import { Order, IOrder } from '../models/order.model';
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
    filter: {
      status?: string;
      orderType?: string;
      paymentStatus?: string;
      sortBy?: 'totalAmount' | 'itemCount' | 'orderTime';
      sortOrder?: 'asc' | 'desc';
    } = {},
    page: number = 1,
    limit: number = 20
  ) {
    const skip = (page - 1) * limit;
    const query: any = { branchId: new Types.ObjectId(branchId) };

    if (filter.status) {
      const statuses = filter.status.split(',').map((s) => s.trim()).filter(Boolean);
      query.status = statuses.length === 1 ? statuses[0] : { $in: statuses };
    }
    if (filter.orderType) query.orderType = filter.orderType;
    if (filter.paymentStatus) {
      const payStatuses = filter.paymentStatus.split(',').map((s) => s.trim()).filter(Boolean);
      query.paymentStatus = payStatuses.length === 1 ? payStatuses[0] : { $in: payStatuses };
    }

    const sortDir = filter.sortOrder === 'asc' ? 1 : -1;
    const sortBy = filter.sortBy || 'orderTime';

    const [orders, total] = await Promise.all([
      Order.find(query)
        .populate('tableId')
        .populate('assignedStaffId')
        .skip(skip)
        .limit(limit)
        .sort(sortBy === 'totalAmount' ? { totalAmount: sortDir } : { orderTime: -1 }),
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

  async findByBranchFull(
    branchId: string,
    filter: {
      status?: string;
      orderType?: string;
      paymentStatus?: string;
      sortBy?: 'totalAmount' | 'itemCount' | 'orderTime';
      sortOrder?: 'asc' | 'desc';
    } = {},
    page: number = 1,
    limit: number = 20
  ) {
    const skip = (page - 1) * limit;
    const matchQuery: any = { branchId: new Types.ObjectId(branchId) };

    if (filter.status) {
      const statuses = filter.status.split(',').map((s) => s.trim()).filter(Boolean);
      matchQuery.status = statuses.length === 1 ? statuses[0] : { $in: statuses };
    }
    if (filter.orderType) matchQuery.orderType = filter.orderType;
    if (filter.paymentStatus) {
      const payStatuses = filter.paymentStatus.split(',').map((s) => s.trim()).filter(Boolean);
      matchQuery.paymentStatus = payStatuses.length === 1 ? payStatuses[0] : { $in: payStatuses };
    }

    const sortDir = filter.sortOrder === 'asc' ? 1 : -1;
    const sortBy = filter.sortBy || 'orderTime';

    // Build sort stage
    let sortStage: any;
    if (sortBy === 'totalAmount') {
      sortStage = { totalAmount: sortDir };
    } else if (sortBy === 'itemCount') {
      sortStage = { _itemCount: sortDir };
    } else {
      sortStage = { orderTime: -1 }; // default: newest first
    }

    // Use aggregation when sorting by itemCount to compute it
    if (sortBy === 'itemCount') {
      const pipeline: any[] = [
        { $match: matchQuery },
        { $addFields: { _itemCount: { $sum: '$items.quantity' } } },
        { $sort: sortStage },
        {
          $facet: {
            orders: [{ $skip: skip }, { $limit: limit }],
            count: [{ $count: 'total' }],
          },
        },
      ];

      const [result] = await Order.aggregate(pipeline);
      const orders = result?.orders ?? [];
      const total = result?.count?.[0]?.total ?? 0;

      // Populate manually after aggregation
      await Order.populate(orders, [
        { path: 'restaurantId' },
        { path: 'branchId' },
        { path: 'tableId' },
        { path: 'assignedStaffId' },
        { path: 'items.menuItemId' },
        { path: 'taxes.taxId' },
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

    // Regular query path (orderTime or totalAmount)
    const [orders, total] = await Promise.all([
      Order.find(matchQuery)
        .populate('restaurantId')
        .populate('branchId')
        .populate('tableId')
        .populate('assignedStaffId')
        .populate('items.menuItemId')
        .populate('taxes.taxId')
        .skip(skip)
        .limit(limit)
        .sort(sortStage),
      Order.countDocuments(matchQuery),
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
      status: { $nin: ['completed', 'cancelled'] },
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
      status: { $nin: ['completed', 'cancelled'] },
    });
    return count > 0;
  }

  /**
   * Check if table has any active orders other than the specified one
   */
  async hasOtherActiveOrders(tableId: string, excludeOrderId: string): Promise<boolean> {
    const count = await Order.countDocuments({
      tableId,
      _id: { $ne: new Types.ObjectId(excludeOrderId) },
      status: { $nin: ['completed', 'cancelled'] },
    });
    return count > 0;
  }
}
