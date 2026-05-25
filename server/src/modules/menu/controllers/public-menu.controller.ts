import { Request, Response } from 'express';
import { PublicMenuService } from '../services/public-menu.service';
import { catchAsync, sendResponse, ParamsUtil } from '@/utils';

export class PublicMenuController {
  private menuService: PublicMenuService;

  constructor() {
    this.menuService = new PublicMenuService();
  }

  /** GET /public/categories/:restaurantSlug — lightweight category list */
  getCategoriesBySlug = catchAsync(async (req: Request, res: Response) => {
    const restaurantSlug = ParamsUtil.getString(req.params.restaurantSlug);
    const data = await this.menuService.getCategoriesBySlug(restaurantSlug);
    sendResponse(res, 200, { message: 'Categories retrieved successfully', data });
  });

  /** GET /public/menu/:restaurantSlug — full menu with items */
  getMenuBySlug = catchAsync(async (req: Request, res: Response) => {
    const restaurantSlug = ParamsUtil.getString(req.params.restaurantSlug);
    const data = await this.menuService.getMenuBySlug(restaurantSlug);
    sendResponse(res, 200, { message: 'Menu retrieved successfully', data });
  });

  /** GET /public/restaurant/:restaurantSlug */
  getRestaurantInfo = catchAsync(async (req: Request, res: Response) => {
    const restaurantSlug = ParamsUtil.getString(req.params.restaurantSlug);
    const data = await this.menuService.getRestaurantInfo(restaurantSlug);
    sendResponse(res, 200, { message: 'Restaurant info retrieved successfully', data });
  });
}
