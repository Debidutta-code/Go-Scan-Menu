// src/controllers/menuitem.controller.ts
import { Request, Response } from 'express';
import { MenuItemService } from '@/services/menuitem.service';
import { catchAsync, sendResponse } from '@/utils';

export class MenuItemController {
  private menuItemService: MenuItemService;

  constructor() {
    this.menuItemService = new MenuItemService();
  }

  createMenuItem = catchAsync(async (req: Request, res: Response) => {
    const restaurantId = req.params.restaurantId || req.user?.restaurantId;

    if (!restaurantId) {
      sendResponse(res, 400, {
        message: 'Restaurant ID is required',
      });
      return;
    }

    const menuItem = await this.menuItemService.createMenuItem(restaurantId, req.body);

    sendResponse(res, 201, {
      message: 'Menu item created successfully',
      data: menuItem,
    });
  });

  getMenuItem = catchAsync(async (req: Request, res: Response) => {
    const menuItem = await this.menuItemService.getMenuItem(req.params.id);

    sendResponse(res, 200, {
      message: 'Menu item retrieved successfully',
      data: menuItem,
    });
  });

  getMenuItemsByCategory = catchAsync(async (req: Request, res: Response) => {
    const { categoryId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;

    const result = await this.menuItemService.getMenuItemsByCategory(categoryId, page, limit);

    sendResponse(res, 200, {
      message: 'Menu items retrieved successfully',
      data: result,
    });
  });

  getMenuItemsByRestaurant = catchAsync(async (req: Request, res: Response) => {
    const restaurantId = req.params.restaurantId || req.user?.restaurantId;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;

    const filter: any = {};
    if (req.query.scope) filter.scope = req.query.scope;
    if (req.query.isAvailable) filter.isAvailable = req.query.isAvailable === 'true';

    const result = await this.menuItemService.getMenuItemsByRestaurant(
      restaurantId!,
      filter,
      page,
      limit
    );

    sendResponse(res, 200, {
      message: 'Menu items retrieved successfully',
      data: result,
    });
  });

  getMenuItemsByBranch = catchAsync(async (req: Request, res: Response) => {
    const { branchId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;

    const result = await this.menuItemService.getMenuItemsByBranch(branchId, page, limit);

    sendResponse(res, 200, {
      message: 'Menu items retrieved successfully',
      data: result,
    });
  });

  getAllMenuItemsForMenu = catchAsync(async (req: Request, res: Response) => {
    const restaurantId = req.params.restaurantId || req.user?.restaurantId;
    const branchId = req.query.branchId as string | undefined;

    const menuItems = await this.menuItemService.getAllMenuItemsForMenu(restaurantId!, branchId);

    sendResponse(res, 200, {
      message: 'Menu items retrieved successfully',
      data: menuItems,
    });
  });

  updateMenuItem = catchAsync(async (req: Request, res: Response) => {
    const restaurantId = req.params.restaurantId || req.user?.restaurantId;
    const menuItem = await this.menuItemService.updateMenuItem(
      req.params.id,
      restaurantId!,
      req.body
    );

    sendResponse(res, 200, {
      message: 'Menu item updated successfully',
      data: menuItem,
    });
  });

  updateAvailability = catchAsync(async (req: Request, res: Response) => {
    const restaurantId = req.params.restaurantId || req.user?.restaurantId;
    const { isAvailable } = req.body;

    if (isAvailable === undefined) {
      sendResponse(res, 400, {
        message: 'isAvailable field is required',
      });
      return;
    }

    const menuItem = await this.menuItemService.updateAvailability(
      req.params.id,
      restaurantId!,
      isAvailable
    );

    sendResponse(res, 200, {
      message: 'Availability updated successfully',
      data: menuItem,
    });
  });

  updateBranchPricing = catchAsync(async (req: Request, res: Response) => {
    const restaurantId = req.params.restaurantId || req.user?.restaurantId;
    const { branchId } = req.params;
    const { price, discountPrice, isAvailable } = req.body;

    if (!price || isAvailable === undefined) {
      sendResponse(res, 400, {
        message: 'price and isAvailable are required',
      });
      return;
    }

    const menuItem = await this.menuItemService.updateBranchPricing(
      req.params.id,
      restaurantId!,
      branchId,
      { price, discountPrice, isAvailable }
    );

    sendResponse(res, 200, {
      message: 'Branch pricing updated successfully',
      data: menuItem,
    });
  });

  deleteMenuItem = catchAsync(async (req: Request, res: Response) => {
    const restaurantId = req.params.restaurantId || req.user?.restaurantId;
    const menuItem = await this.menuItemService.deleteMenuItem(req.params.id, restaurantId!);

    sendResponse(res, 200, {
      message: 'Menu item deleted successfully',
      data: menuItem,
    });
  });
}
