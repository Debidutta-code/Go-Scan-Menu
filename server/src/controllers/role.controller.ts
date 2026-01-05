// src/controllers/role.controller.ts
import { Request, Response } from 'express';
import { RoleService } from '@/services/role.service';
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
}
