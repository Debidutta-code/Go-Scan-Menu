// src/controllers/customersession.controller.ts
import { Request, Response } from 'express';
import { CustomerSessionService } from '@/services/customersession.service';
import { catchAsync, sendResponse } from '@/utils';

export class CustomerSessionController {
  private sessionService: CustomerSessionService;

  constructor() {
    this.sessionService = new CustomerSessionService();
  }

  createSession = catchAsync(async (req: Request, res: Response) => {
    const { restaurantId, branchId, tableId, themePreference } = req.body;

    if (!restaurantId || !branchId || !tableId) {
      sendResponse(res, 400, {
        message: 'Restaurant ID, Branch ID, and Table ID are required',
      });
      return;
    }

    const session = await this.sessionService.createSession({
      restaurantId,
      branchId,
      tableId,
      themePreference,
    });

    sendResponse(res, 201, {
      message: 'Customer session created successfully',
      data: session,
    });
  });

  getSession = catchAsync(async (req: Request, res: Response) => {
    const { sessionId } = req.params;

    const session = await this.sessionService.getSessionBySessionId(sessionId);

    sendResponse(res, 200, {
      message: 'Session retrieved successfully',
      data: session,
    });
  });

  getActiveSessionByTable = catchAsync(async (req: Request, res: Response) => {
    const { tableId } = req.params;

    const session = await this.sessionService.getActiveSessionByTable(tableId);

    sendResponse(res, 200, {
      message: 'Active session retrieved successfully',
      data: session,
    });
  });

  updateThemePreference = catchAsync(async (req: Request, res: Response) => {
    const { sessionId } = req.params;
    const { themePreference } = req.body;

    if (!themePreference) {
      sendResponse(res, 400, {
        message: 'Theme preference is required',
      });
      return;
    }

    const session = await this.sessionService.updateThemePreference(sessionId, themePreference);

    sendResponse(res, 200, {
      message: 'Theme preference updated successfully',
      data: session,
    });
  });

  updateActiveOrder = catchAsync(async (req: Request, res: Response) => {
    const { sessionId } = req.params;
    const { orderId } = req.body;

    const session = await this.sessionService.updateActiveOrder(sessionId, orderId || null);

    sendResponse(res, 200, {
      message: 'Active order updated successfully',
      data: session,
    });
  });

  updateActivity = catchAsync(async (req: Request, res: Response) => {
    const { sessionId } = req.params;

    const session = await this.sessionService.updateActivity(sessionId);

    sendResponse(res, 200, {
      message: 'Activity updated successfully',
      data: session,
    });
  });

  endSession = catchAsync(async (req: Request, res: Response) => {
    const { sessionId } = req.params;

    const session = await this.sessionService.endSession(sessionId);

    sendResponse(res, 200, {
      message: 'Session ended successfully',
      data: session,
    });
  });

  getActiveSessions = catchAsync(async (req: Request, res: Response) => {
    const { branchId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const result = await this.sessionService.getActiveSessionsByBranch(branchId, page, limit);

    sendResponse(res, 200, {
      message: 'Active sessions retrieved successfully',
      data: result,
    });
  });
}
