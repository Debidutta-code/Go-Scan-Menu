import { Request, Response } from 'express';
import { PublicMenuService } from '../services/public-menu.service';
import { catchAsync, sendResponse, ParamsUtil } from '@/utils';

export class PublicMenuController {
  private menuService: PublicMenuService;

  constructor() {
    this.menuService = new PublicMenuService();
  }

  /**
   * Get initial public data (restaurant and table info)
   */
  getInitData = catchAsync(async (req: Request, res: Response) => {
    const restaurantSlug = ParamsUtil.getString(req.params.restaurantSlug);
    const qrCode = req.params.qrCode ? ParamsUtil.getString(req.params.qrCode) : undefined;

    const initData = await this.menuService.getPublicInitData(restaurantSlug, qrCode);

    sendResponse(res, 200, {
      message: 'Initial data retrieved successfully',
      data: initData,
    });
  });

  /**
   * Get categories list
   */
  getCategories = catchAsync(async (req: Request, res: Response) => {
    const restaurantSlug = ParamsUtil.getString(req.params.restaurantSlug);

    const categories = await this.menuService.getPublicCategories(restaurantSlug);

    sendResponse(res, 200, {
      message: 'Categories retrieved successfully',
      data: categories,
    });
  });

  /**
   * Get full menu (categories with items)
   */
  getMenu = catchAsync(async (req: Request, res: Response) => {
    const restaurantSlug = ParamsUtil.getString(req.params.restaurantSlug);

    const menu = await this.menuService.getPublicMenu(restaurantSlug);

    sendResponse(res, 200, {
      message: 'Menu retrieved successfully',
      data: menu,
    });
  });

  /**
   * Get complete menu for a specific table (QR code scan)
   * Returns: restaurant theme, table, menu grouped by categories
   * @deprecated
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
   * @deprecated
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
