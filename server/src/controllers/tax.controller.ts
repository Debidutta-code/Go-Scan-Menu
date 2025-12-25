// src/controllers/tax.controller.ts
import { Request, Response } from 'express';
import { TaxService } from '@/services/tax.service';
import { catchAsync, sendResponse } from '@/utils';

export class TaxController {
  private taxService: TaxService;

  constructor() {
    this.taxService = new TaxService();
  }

  createTax = catchAsync(async (req: Request, res: Response) => {
    const restaurantId = req.params.restaurantId || req.user?.restaurantId;

    if (!restaurantId) {
      sendResponse(res, 400, {
        message: 'Restaurant ID is required',
      });
      return;
    }

    const tax = await this.taxService.createTax(restaurantId, req.body);

    sendResponse(res, 201, {
      message: 'Tax created successfully',
      data: tax,
    });
  });

  getTax = catchAsync(async (req: Request, res: Response) => {
    const tax = await this.taxService.getTax(req.params.id);

    sendResponse(res, 200, {
      message: 'Tax retrieved successfully',
      data: tax,
    });
  });

  getTaxesByRestaurant = catchAsync(async (req: Request, res: Response) => {
    const restaurantId = req.params.restaurantId || req.user?.restaurantId;
    const scope = (req.query.scope as 'restaurant' | 'branch') || 'restaurant';
    const category = req.query.category as string | undefined;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;

    const result = await this.taxService.getTaxesByRestaurant(
      restaurantId!,
      scope,
      category,
      page,
      limit
    );

    sendResponse(res, 200, {
      message: 'Taxes retrieved successfully',
      data: result,
    });
  });

  getTaxesByBranch = catchAsync(async (req: Request, res: Response) => {
    const { branchId } = req.params;
    const category = req.query.category as string | undefined;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;

    const result = await this.taxService.getTaxesByBranch(branchId, category, page, limit);

    sendResponse(res, 200, {
      message: 'Taxes retrieved successfully',
      data: result,
    });
  });

  getApplicableTaxes = catchAsync(async (req: Request, res: Response) => {
    const restaurantId = req.params.restaurantId || req.user?.restaurantId;
    const { branchId, orderType, orderAmount } = req.query;

    const taxes = await this.taxService.getApplicableTaxes(
      restaurantId!,
      branchId as string | undefined,
      orderType as 'dine-in' | 'takeaway' | undefined,
      orderAmount ? parseFloat(orderAmount as string) : undefined
    );

    sendResponse(res, 200, {
      message: 'Applicable taxes retrieved successfully',
      data: taxes,
    });
  });

  updateTax = catchAsync(async (req: Request, res: Response) => {
    const restaurantId = req.params.restaurantId || req.user?.restaurantId;
    const tax = await this.taxService.updateTax(req.params.id, restaurantId!, req.body);

    sendResponse(res, 200, {
      message: 'Tax updated successfully',
      data: tax,
    });
  });

  updateTaxStatus = catchAsync(async (req: Request, res: Response) => {
    const restaurantId = req.params.restaurantId || req.user?.restaurantId;
    const { isActive } = req.body;

    if (isActive === undefined) {
      sendResponse(res, 400, {
        message: 'isActive status is required',
      });
      return;
    }

    const tax = await this.taxService.updateTaxStatus(req.params.id, restaurantId!, isActive);

    sendResponse(res, 200, {
      message: 'Tax status updated successfully',
      data: tax,
    });
  });

  deleteTax = catchAsync(async (req: Request, res: Response) => {
    const restaurantId = req.params.restaurantId || req.user?.restaurantId;
    const tax = await this.taxService.deleteTax(req.params.id, restaurantId!);

    sendResponse(res, 200, {
      message: 'Tax deleted successfully',
      data: tax,
    });
  });
}
