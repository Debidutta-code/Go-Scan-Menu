// src/controllers/role.controller.ts
import { Request, Response } from 'express';
import { RoleService } from '../services/role.service';
import { catchAsync, sendResponse } from '@/utils';

export class RoleController {
  private roleService: RoleService;

  constructor() {
    this.roleService = new RoleService();
  }

  getRole = catchAsync(async (req: Request, res: Response) => {
    const role = await this.roleService.getRole(req.params.id);
    sendResponse(res, 200, {
      message: 'Role retrieved successfully',
      data: role,
    });
  });

  getAllRoles = catchAsync(async (req: Request, res: Response) => {
    const roles = await this.roleService.getAllRoles();
    sendResponse(res, 200, {
      message: 'Roles retrieved successfully',
      data: roles,
    });
  });

  getSystemRoles = catchAsync(async (req: Request, res: Response) => {
    const roles = await this.roleService.getSystemRoles();
    sendResponse(res, 200, {
      message: 'System roles retrieved successfully',
      data: roles,
    });
  });

  updateRole = catchAsync(async (req: Request, res: Response) => {
    const role = await this.roleService.updateRole(req.params.id, req.body);
    sendResponse(res, 200, {
      message: 'Role updated successfully',
      data: role,
    });
  });

  updateRolePermissions = catchAsync(async (req: Request, res: Response) => {
    const role = await this.roleService.updateRolePermissions(req.params.id, req.body);
    sendResponse(res, 200, {
      message: 'Role permissions updated successfully',
      data: role,
    });
  });

  deleteRole = catchAsync(async (req: Request, res: Response) => {
    const role = await this.roleService.deleteRole(req.params.id);
    sendResponse(res, 200, {
      message: 'Role deleted successfully',
      data: role,
    });
  });

  // --- NEW CONTROLLER METHODS FOR STAFF TYPE PERMISSIONS ---

  getPermissionsForStaffType = catchAsync(async (req: Request, res: Response) => {
    const { restaurantId, staffType } = req.params;
    const role = await this.roleService.getPermissionsByStaffType(restaurantId, staffType);
    sendResponse(res, 200, {
      message: 'Permissions retrieved successfully',
      data: role,
    });
  });

  updatePermissionsForStaffType = catchAsync(async (req: Request, res: Response) => {
    const { restaurantId, staffType } = req.params;
    const { permissions } = req.body;
    const role = await this.roleService.updatePermissionsByStaffType(
      restaurantId,
      staffType,
      permissions
    );
    sendResponse(res, 200, {
      message: 'Permissions updated successfully',
      data: role,
    });
  });

  initializeRestaurantPermissions = catchAsync(async (req: Request, res: Response) => {
    const { restaurantId } = req.params;
    await this.roleService.initializeRestaurantRoles(restaurantId);
    sendResponse(res, 201, {
      message: 'Restaurant permissions initialized successfully',
      data: null,
    });
  });

  getAllRestaurantStaffTypePermissions = catchAsync(async (req: Request, res: Response) => {
    const { restaurantId } = req.params;
    const roles = await this.roleService.getAllRestaurantStaffTypePermissions(restaurantId);
    sendResponse(res, 200, {
      message: 'Restaurant staff type permissions retrieved successfully',
      data: roles,
    });
  });
}
