// src/controllers/branch.controller.ts
import { Request, Response } from 'express';
import { BranchService } from '@/services/branch.service';
import { catchAsync, sendResponse, ParamsUtil } from '@/utils';

export class BranchController {
  private branchService: BranchService;

  constructor() {
    this.branchService = new BranchService();
  }

  createBranch = catchAsync(async (req: Request, res: Response) => {
    const restaurantId = ParamsUtil.getString(req.params.restaurantId) || (req as any).user.restaurantId;
    const branch = await this.branchService.createBranch(restaurantId, req.body);
    sendResponse(res, 201, {
      message: 'Branch created successfully',
      data: branch,
    });
  });

  getBranch = catchAsync(async (req: Request, res: Response) => {
    const restaurantId = ParamsUtil.getString(req.params.restaurantId) || (req as any).user.restaurantId;
    const branch = await this.branchService.getBranch(ParamsUtil.getString(req.params.id), restaurantId);
    sendResponse(res, 200, {
      data: branch,
      message: '',
    });
  });

  getBranches = catchAsync(async (req: Request, res: Response) => {
    const restaurantId = ParamsUtil.getString(req.params.restaurantId) || (req as any).user.restaurantId;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const result = await this.branchService.getBranchesByRestaurant(restaurantId, page, limit);
    sendResponse(res, 200, {
      data: result,
      message: '',
    });
  });

  updateBranch = catchAsync(async (req: Request, res: Response) => {
    const restaurantId = ParamsUtil.getString(req.params.restaurantId) || (req as any).user.restaurantId;
    const branch = await this.branchService.updateBranch(ParamsUtil.getString(req.params.id), restaurantId, req.body);
    sendResponse(res, 200, {
      message: 'Branch updated successfully',
      data: branch,
    });
  });

  updateBranchSettings = catchAsync(async (req: Request, res: Response) => {
    const restaurantId = ParamsUtil.getString(req.params.restaurantId) || (req as any).user.restaurantId;
    const branch = await this.branchService.updateBranchSettings(
      ParamsUtil.getString(req.params.id),
      restaurantId,
      req.body
    );
    sendResponse(res, 200, {
      message: 'Branch settings updated successfully',
      data: branch,
    });
  });

  assignManager = catchAsync(async (req: Request, res: Response) => {
    const restaurantId = ParamsUtil.getString(req.params.restaurantId) || (req as any).user.restaurantId;
    const branch = await this.branchService.assignManager(ParamsUtil.getString(req.params.id), restaurantId, req.body);
    sendResponse(res, 200, {
      message: 'Branch manager assigned successfully',
      data: branch,
    });
  });

  deleteBranch = catchAsync(async (req: Request, res: Response) => {
    const restaurantId = ParamsUtil.getString(req.params.restaurantId) || (req as any).user.restaurantId;
    const branch = await this.branchService.deleteBranch(ParamsUtil.getString(req.params.id), restaurantId);
    sendResponse(res, 200, {
      message: 'Branch deleted successfully',
      data: branch,
    });
  });
}
