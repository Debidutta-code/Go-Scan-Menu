// src/services/menuitem.service.ts
import { MenuItemRepository } from '@/repositories/menuitem.repository';
import { CategoryRepository } from '@/repositories/category.repository';
import { RestaurantRepository } from '@/repositories/restaurant.repository';
import { BranchRepository } from '@/repositories/branch.repository';
import { IMenuItem } from '@/models/MenuItem.model';
import { AppError } from '@/utils/AppError';
import { Types } from 'mongoose';

export class MenuItemService {
  private menuItemRepo: MenuItemRepository;
  private categoryRepo: CategoryRepository;
  private restaurantRepo: RestaurantRepository;
  private branchRepo: BranchRepository;

  constructor() {
    this.menuItemRepo = new MenuItemRepository();
    this.categoryRepo = new CategoryRepository();
    this.restaurantRepo = new RestaurantRepository();
    this.branchRepo = new BranchRepository();
  }

  async createMenuItem(
    restaurantId: string,
    data: {
      categoryId: string;
      name: string;
      description?: string;
      image?: string;
      images?: string[];
      price: number;
      discountPrice?: number;
      scope: 'restaurant' | 'branch';
      branchId?: string;
      preparationTime?: number;
      calories?: number;
      spiceLevel?: IMenuItem['spiceLevel'];
      tags?: string[];
      allergens?: string[];
      variants?: IMenuItem['variants'];
      addons?: IMenuItem['addons'];
      customizations?: IMenuItem['customizations'];
      isAvailable?: boolean;
      availableQuantity?: number;
      displayOrder?: number;
    }
  ) {
    // Verify restaurant exists
    const restaurant = await this.restaurantRepo.findById(restaurantId);
    if (!restaurant || !restaurant.isActive) {
      throw new AppError('Restaurant not found or inactive', 404);
    }

    // Verify category exists
    const category = await this.categoryRepo.findById(data.categoryId);
    if (!category || !category.isActive) {
      throw new AppError('Category not found or inactive', 404);
    }

    // If scope is branch, verify branch exists
    if (data.scope === 'branch') {
      if (!data.branchId) {
        throw new AppError('Branch ID is required for branch-specific items', 400);
      }

      const branch = await this.branchRepo.findByIdAndRestaurant(data.branchId, restaurantId);
      if (!branch || !branch.isActive) {
        throw new AppError('Branch not found or inactive', 404);
      }
    }

    // Get next display order if not provided
    let displayOrder = data.displayOrder;
    if (displayOrder === undefined) {
      const count = await this.menuItemRepo.countByCategory(data.categoryId);
      displayOrder = count;
    }

    const menuItemData: Partial<IMenuItem> = {
      restaurantId: new Types.ObjectId(restaurantId),
      branchId: data.branchId ? new Types.ObjectId(data.branchId) : undefined,
      categoryId: new Types.ObjectId(data.categoryId),
      name: data.name,
      description: data.description,
      image: data.image,
      images: data.images || [],
      price: data.price,
      discountPrice: data.discountPrice,
      scope: data.scope,
      branchPricing: [],
      preparationTime: data.preparationTime,
      calories: data.calories,
      spiceLevel: data.spiceLevel,
      tags: data.tags || [],
      allergens: data.allergens || [],
      variants: data.variants || [],
      addons: data.addons || [],
      customizations: data.customizations || [],
      isAvailable: data.isAvailable !== undefined ? data.isAvailable : true,
      availableQuantity: data.availableQuantity,
      isActive: true,
      displayOrder,
    };

    const menuItem = await this.menuItemRepo.create(menuItemData);
    return menuItem;
  }

  async getMenuItem(id: string): Promise<IMenuItem> {
    const menuItem = await this.menuItemRepo.findById(id);
    if (!menuItem || !menuItem.isActive) {
      throw new AppError('Menu item not found', 404);
    }
    return menuItem;
  }

  async getMenuItemsByCategory(categoryId: string, page: number = 1, limit: number = 50) {
    return this.menuItemRepo.findByCategory(categoryId, page, limit);
  }

  async getMenuItemsByRestaurant(
    restaurantId: string,
    filter: any = {},
    page: number = 1,
    limit: number = 50
  ) {
    return this.menuItemRepo.findByRestaurant(restaurantId, filter, page, limit);
  }

  async getMenuItemsByBranch(
    branchId: string,
    filter: any = {},
    page: number = 1,
    limit: number = 50
  ) {
    return this.menuItemRepo.findByBranch(branchId, filter, page, limit);
  }

  async getAllMenuItemsForMenu(restaurantId: string, branchId?: string) {
    // Returns both restaurant-wide and branch-specific items
    const items = await this.menuItemRepo.findAllForMenu(restaurantId, branchId);

    // If branchId provided, apply branch pricing
    if (branchId) {
      return items.map((item: any) => {
        const branchPrice = item.branchPricing.find(
          (bp: any) => bp.branchId.toString() === branchId
        );

        if (branchPrice) {
          return {
            ...item.toObject(),
            price: branchPrice.price,
            discountPrice: branchPrice.discountPrice,
            isAvailable: branchPrice.isAvailable,
          };
        }

        return item;
      });
    }

    return items;
  }

  async updateMenuItem(
    id: string,
    restaurantId: string,
    data: Partial<IMenuItem>
  ): Promise<IMenuItem> {
    const menuItem = await this.menuItemRepo.findById(id);
    if (!menuItem || !menuItem.isActive) {
      throw new AppError('Menu item not found', 404);
    }

    if (menuItem.restaurantId.toString() !== restaurantId) {
      throw new AppError('Menu item does not belong to this restaurant', 403);
    }

    const updatedMenuItem = await this.menuItemRepo.update(id, data);
    if (!updatedMenuItem) {
      throw new AppError('Failed to update menu item', 500);
    }

    return updatedMenuItem;
  }

  async updateAvailability(
    id: string,
    restaurantId: string,
    isAvailable: boolean
  ): Promise<IMenuItem> {
    const menuItem = await this.menuItemRepo.findById(id);
    if (!menuItem || !menuItem.isActive) {
      throw new AppError('Menu item not found', 404);
    }

    if (menuItem.restaurantId.toString() !== restaurantId) {
      throw new AppError('Menu item does not belong to this restaurant', 403);
    }

    const updatedMenuItem = await this.menuItemRepo.updateAvailability(id, isAvailable);
    if (!updatedMenuItem) {
      throw new AppError('Failed to update availability', 500);
    }

    return updatedMenuItem;
  }

  async updateBranchPricing(
    id: string,
    restaurantId: string,
    branchId: string,
    pricing: { price: number; discountPrice?: number; isAvailable: boolean }
  ): Promise<IMenuItem> {
    const menuItem = await this.menuItemRepo.findById(id);
    if (!menuItem || !menuItem.isActive) {
      throw new AppError('Menu item not found', 404);
    }

    if (menuItem.restaurantId.toString() !== restaurantId) {
      throw new AppError('Menu item does not belong to this restaurant', 403);
    }

    // Only restaurant-wide items can have branch pricing
    if (menuItem.scope !== 'restaurant') {
      throw new AppError('Only restaurant-wide items can have branch-specific pricing', 400);
    }

    // Verify branch exists and belongs to restaurant
    const branch = await this.branchRepo.findByIdAndRestaurant(branchId, restaurantId);
    if (!branch || !branch.isActive) {
      throw new AppError('Branch not found or inactive', 404);
    }

    const updatedMenuItem = await this.menuItemRepo.updateBranchPricing(id, branchId, pricing);
    if (!updatedMenuItem) {
      throw new AppError('Failed to update branch pricing', 500);
    }

    return updatedMenuItem;
  }

  async deleteMenuItem(id: string, restaurantId: string): Promise<IMenuItem> {
    const menuItem = await this.menuItemRepo.findById(id);
    if (!menuItem) {
      throw new AppError('Menu item not found', 404);
    }

    if (menuItem.restaurantId.toString() !== restaurantId) {
      throw new AppError('Menu item does not belong to this restaurant', 403);
    }

    const deletedMenuItem = await this.menuItemRepo.softDelete(id);
    if (!deletedMenuItem) {
      throw new AppError('Failed to delete menu item', 500);
    }

    return deletedMenuItem;
  }
}
