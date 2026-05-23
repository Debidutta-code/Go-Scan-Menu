import { Request, Response } from 'express';
import { PublicMenuService } from '../services/public-menu.service';
import { catchAsync, sendResponse, ParamsUtil } from '@/utils';

export class PublicMenuController {
  private menuService: PublicMenuService;

  constructor() {
    this.menuService = new PublicMenuService();
  }

  /**
   * Get complete menu for a restaurant
   */
  getMenuBySlug = catchAsync(async (req: Request, res: Response) => {
    const restaurantSlug = ParamsUtil.getString(req.params.restaurantSlug);

    const menuData = await this.menuService.getMenuBySlug(restaurantSlug);

    sendResponse(res, 200, {
      message: 'Menu retrieved successfully',
      data: menuData,
    });
  });

  /**
   * Get restaurant info
   */
  getRestaurantInfo = catchAsync(async (req: Request, res: Response) => {
    const restaurantSlug = ParamsUtil.getString(req.params.restaurantSlug);

    const restaurantInfo = await this.menuService.getRestaurantInfo(restaurantSlug);

    sendResponse(res, 200, {
      message: 'Restaurant info retrieved successfully',
      data: restaurantInfo,
    });
  });
}
