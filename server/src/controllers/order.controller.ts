// src/controllers/order.controller.ts
import { Request, Response } from 'express';
import { OrderService } from '@/services/order.service';
import { catchAsync, sendResponse } from '@/utils';

export class OrderController {
  private orderService: OrderService;

  constructor() {
    this.orderService = new OrderService();
  }

  createOrder = catchAsync(async (req: Request, res: Response) => {
    const restaurantId = req.params.restaurantId || req.user?.restaurantId;

    if (!restaurantId) {
      sendResponse(res, 400, {
        message: 'Restaurant ID is required',
      });
      return;
    }

    const order = await this.orderService.createOrder(restaurantId, req.body);

    sendResponse(res, 201, {
      message: 'Order created successfully',
      data: order,
    });
  });

  getOrder = catchAsync(async (req: Request, res: Response) => {
    const order = await this.orderService.getOrder(req.params.id);

    sendResponse(res, 200, {
      message: 'Order retrieved successfully',
      data: order,
    });
  });

  getOrderByNumber = catchAsync(async (req: Request, res: Response) => {
    const { orderNumber } = req.params;
    const order = await this.orderService.getOrderByNumber(orderNumber);

    sendResponse(res, 200, {
      message: 'Order retrieved successfully',
      data: order,
    });
  });

  getOrdersByBranch = catchAsync(async (req: Request, res: Response) => {
    const { branchId } = req.params;
    const status = req.query.status as string | undefined;
    const orderType = req.query.orderType as 'dine-in' | 'takeaway' | undefined;
    const paymentStatus = req.query.paymentStatus as string | undefined;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const result = await this.orderService.getOrdersByBranch(
      branchId,
      { status, orderType, paymentStatus },
      page,
      limit
    );

    sendResponse(res, 200, {
      message: 'Orders retrieved successfully',
      data: result,
    });
  });

  getOrdersByTable = catchAsync(async (req: Request, res: Response) => {
    const { tableId } = req.params;
    const status = req.query.status as string | undefined;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const result = await this.orderService.getOrdersByTable(tableId, status, page, limit);

    sendResponse(res, 200, {
      message: 'Orders retrieved successfully',
      data: result,
    });
  });

  updateOrderStatus = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      sendResponse(res, 400, {
        message: 'Status is required',
      });
      return;
    }

    // Validate status value
    const validStatuses = [
      'pending',
      'confirmed',
      'preparing',
      'ready',
      'served',
      'completed',
      'cancelled',
    ];
    if (!validStatuses.includes(status)) {
      sendResponse(res, 400, {
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
      });
      return;
    }

    const order = await this.orderService.updateOrderStatus(id, status);

    sendResponse(res, 200, {
      message: 'Order status updated successfully',
      data: order,
    });
  });

  updateItemStatus = catchAsync(async (req: Request, res: Response) => {
    const { id, itemId } = req.params;
    const { status } = req.body;

    if (!status) {
      sendResponse(res, 400, {
        message: 'Status is required',
      });
      return;
    }

    const order = await this.orderService.updateItemStatus(id, itemId, status);

    sendResponse(res, 200, {
      message: 'Item status updated successfully',
      data: order,
    });
  });

  updatePaymentStatus = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { paymentStatus, paymentMethod } = req.body;

    if (!paymentStatus) {
      sendResponse(res, 400, {
        message: 'Payment status is required',
      });
      return;
    }

    // Validate payment status
    const validPaymentStatuses = ['pending', 'paid', 'failed'];
    if (!validPaymentStatuses.includes(paymentStatus)) {
      sendResponse(res, 400, {
        message: `Invalid payment status. Must be one of: ${validPaymentStatuses.join(', ')}`,
      });
      return;
    }

    // Validate payment method if provided
    if (paymentMethod) {
      const validPaymentMethods = ['cash', 'card', 'upi', 'wallet', 'online'];
      if (!validPaymentMethods.includes(paymentMethod)) {
        sendResponse(res, 400, {
          message: `Invalid payment method. Must be one of: ${validPaymentMethods.join(', ')}`,
        });
        return;
      }
    }

    const order = await this.orderService.updatePaymentStatus(id, paymentStatus, paymentMethod);

    sendResponse(res, 200, {
      message: 'Payment status updated successfully',
      data: order,
    });
  });

  assignStaff = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { staffId, staffName } = req.body;

    if (!staffId || !staffName) {
      sendResponse(res, 400, {
        message: 'Staff ID and name are required',
      });
      return;
    }

    const order = await this.orderService.assignStaff(id, staffId, staffName);

    sendResponse(res, 200, {
      message: 'Staff assigned successfully',
      data: order,
    });
  });

  cancelOrder = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { cancellationReason } = req.body;

    const order = await this.orderService.cancelOrder(id, cancellationReason);

    sendResponse(res, 200, {
      message: 'Order cancelled successfully',
      data: order,
    });
  });
}
