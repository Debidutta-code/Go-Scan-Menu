// Staff Type Permissions Controller
import { Request, Response } from 'express';
import { StaffTypePermissionsService } from '@/services/staffTypePermissions.service';
import { catchAsync, sendResponse } from '@/utils';
import { StaffType } from '@/models/StaffTypePermissions.model';

export class StaffTypePermissionsController {
  private permissionsService: StaffTypePermissionsService;

  constructor() {
    this.permissionsService = new StaffTypePermissionsService();
  }

  // GET /api/staff-type-permissions/:restaurantId
  getAllStaffTypePermissions = catchAsync(async (req: Request, res: Response) => {
    const { restaurantId } = req.params;
    const permissions = await this.permissionsService.getAllStaffTypePermissions(restaurantId);
    
    sendResponse(res, 200, {
      message: 'Staff type permissions retrieved successfully',
      data: permissions,
    });
  });

  // GET /api/staff-type-permissions/:restaurantId/:staffType
  getPermissionsForStaffType = catchAsync(async (req: Request, res: Response) => {
    const { restaurantId, staffType } = req.params;
    const permissions = await this.permissionsService.getPermissionsForStaffType(
      restaurantId,
      staffType as StaffType
    );

    sendResponse(res, 200, {
      message: 'Permissions retrieved successfully',
      data: permissions,
    });
  });

  // PUT /api/staff-type-permissions/:restaurantId/:staffType
  updatePermissionsForStaffType = catchAsync(async (req: Request, res: Response) => {
    const { restaurantId, staffType } = req.params;
    const permissions = await this.permissionsService.updatePermissionsForStaffType(
      restaurantId,
      staffType as StaffType,
      req.body
    );

    sendResponse(res, 200, {
      message: 'Permissions updated successfully',
      data: permissions,
    });
  });

  // POST /api/staff-type-permissions/:restaurantId/initialize
  initializeAllPermissions = catchAsync(async (req: Request, res: Response) => {
    const { restaurantId } = req.params;
    await this.permissionsService.initializeAllDefaultPermissions(restaurantId);

    sendResponse(res, 200, {
      message: 'All staff type permissions initialized successfully',
      data: null,
    });
  });
}
