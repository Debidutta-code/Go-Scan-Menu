import { Request, Response } from 'express';
import { PublicMenuService } from '../services/public-menu.service';
import { catchAsync, sendResponse, ParamsUtil } from '@/utils';

export class PublicMenuController {
  private menuService: PublicMenuService;

  constructor() {
    this.menuService = new PublicMenuService();
  }

  /**
   * Get complete menu for a specific table (QR code scan)
   * Returns: restaurant theme, table, menu grouped by categories
   */
  getMenuByQrCode = catchAsync(async (req: Request, res: Response) => {
    const restaurantSlug = ParamsUtil.getString(req.params.restaurantSlug);
    const qrCode = ParamsUtil.getString(req.params.qrCode);

    const menuData = await this.menuService.getCompleteMenuByQrCode(
      restaurantSlug,
      qrCode
    );

    sendResponse(res, 200, {
      message: 'Menu retrieved successfully',
      data: menuData,
    });
  });

  /**
   * Get menu (without specific table)
   * Useful for takeaway/delivery or browsing without sitting
   */
  getMenuByBranch = catchAsync(async (req: Request, res: Response) => {
    const restaurantSlug = ParamsUtil.getString(req.params.restaurantSlug);

    const menuData = await this.menuService.getCompleteMenuByBranch(restaurantSlug);

    sendResponse(res, 200, {
      message: 'Menu retrieved successfully',
      data: menuData,
    });
  });

  /**
   * Get restaurant info (for landing pages, etc.)
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
