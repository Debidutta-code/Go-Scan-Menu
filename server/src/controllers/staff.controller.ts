// src/controllers/staff.controller.ts
import { Request, Response } from 'express';
import { StaffService } from '@/services/staff.service';
import { catchAsync, sendResponse } from '@/utils';

export class StaffController {
  private staffService: StaffService;

  constructor() {
    this.staffService = new StaffService();
  }

  login = catchAsync(async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const result = await this.staffService.login(email, password);
    sendResponse(res, 200, {
      message: 'Login successful',
      data: result,
    });
  });

  createStaff = catchAsync(async (req: Request, res: Response) => {
    const staff = await this.staffService.createStaff(req.body);
    sendResponse(res, 201, {
      message: 'Staff created successfully',
      data: staff,
    });
  });

  getStaff = catchAsync(async (req: Request, res: Response) => {
    const staff = await this.staffService.getStaff(req.params.id);
    sendResponse(res, 200, {
      message: 'Staff retrieved successfully',
      data: staff,
    });
  });

  getStaffByRestaurant = catchAsync(async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const filter = req.query.filter ? JSON.parse(req.query.filter as string) : {};

    const result = await this.staffService.getStaffByRestaurant(
      req.params.restaurantId,
      filter,
      page,
      limit
    );
    sendResponse(res, 200, {
      message: 'Staff retrieved successfully',
      data: result,
    });
  });

  getStaffByBranch = catchAsync(async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const result = await this.staffService.getStaffByBranch(req.params.branchId, page, limit);
    sendResponse(res, 200, {
      message: 'Staff retrieved successfully',
      data: result,
    });
  });

  updateStaff = catchAsync(async (req: Request, res: Response) => {
    const staff = await this.staffService.updateStaff(req.params.id, req.body);
    sendResponse(res, 200, {
      message: 'Staff updated successfully',
      data: staff,
    });
  });

  updateStaffRole = catchAsync(async (req: Request, res: Response) => {
    const { roleId } = req.body;
    const staff = await this.staffService.updateStaffRole(req.params.id, roleId);
    sendResponse(res, 200, {
      message: 'Staff role updated successfully',
      data: staff,
    });
  });

  deleteStaff = catchAsync(async (req: Request, res: Response) => {
    const staff = await this.staffService.deleteStaff(req.params.id);
    sendResponse(res, 200, {
      message: 'Staff deleted successfully',
      data: staff,
    });
  });

  getCurrentUser = catchAsync(async (req: Request, res: Response) => {
    const staff = await this.staffService.getStaff(req.user!.id);
    sendResponse(res, 200, {
      message: 'Current user retrieved successfully',
      data: staff,
    });
  });
}
