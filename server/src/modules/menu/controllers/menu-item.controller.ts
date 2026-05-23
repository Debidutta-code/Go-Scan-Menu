import { Request, Response } from 'express';
import { MenuItemRepository } from '../repositories/menu-item.repository';
import { catchAsync, sendResponse, ParamsUtil } from '@/utils';

export class MenuItemController {
  private menuItemRepo: MenuItemRepository;

  constructor() {
    this.menuItemRepo = new MenuItemRepository();
  }

  createMenuItem = catchAsync(async (req: Request, res: Response) => {
    const restaurantId = ParamsUtil.getString(req.params.restaurantId);
    const menuItem = await this.menuItemRepo.create({ ...req.body, restaurantId });
    sendResponse(res, 201, { message: 'Menu item created', data: menuItem });
  });

  getMenuItems = catchAsync(async (req: Request, res: Response) => {
    const restaurantId = ParamsUtil.getString(req.params.restaurantId);
    const menuItems = await this.menuItemRepo.findAll(restaurantId);
    sendResponse(res, 200, { message: 'Menu items retrieved', data: menuItems });
  });

  getMenuItem = catchAsync(async (req: Request, res: Response) => {
    const id = ParamsUtil.getString(req.params.id);
    const menuItem = await this.menuItemRepo.findById(id);
    sendResponse(res, 200, { message: 'Menu item retrieved', data: menuItem });
  });

  updateMenuItem = catchAsync(async (req: Request, res: Response) => {
    const id = ParamsUtil.getString(req.params.id);
    const menuItem = await this.menuItemRepo.update(id, req.body);
    sendResponse(res, 200, { message: 'Menu item updated', data: menuItem });
  });

  deleteMenuItem = catchAsync(async (req: Request, res: Response) => {
    const id = ParamsUtil.getString(req.params.id);
    await this.menuItemRepo.delete(id);
    sendResponse(res, 204, { message: 'Menu item deleted' });
  });
}
