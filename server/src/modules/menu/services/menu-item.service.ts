// src/services/menuitem.service.ts
import { MenuItemRepository } from '../repositories/menu-item.repository';
import { CategoryRepository } from '../repositories/category.repository';
import { RestaurantRepository } from '../../restaurant/repositories/restaurant.repository';
import {
  IMenuItem,
  DietaryType,
  Allergen,
  NutritionTag,
  DrinkTemperature,
  DrinkAlcoholContent,
  DrinkCaffeineContent,
} from '../models/menu-item.model';
import { AppError } from '@/utils/AppError';
import { Types } from 'mongoose';

export class MenuItemService {
  private menuItemRepo: MenuItemRepository;
  private categoryRepo: CategoryRepository;
  private restaurantRepo: RestaurantRepository;

  constructor() {
    this.menuItemRepo = new MenuItemRepository();
    this.categoryRepo = new CategoryRepository();
    this.restaurantRepo = new RestaurantRepository();
  }

  /**
   * Helper to extract restaurantId as string from either ObjectId or populated document
   */
  private extractRestaurantId(restaurantId: any): string {
    if (!restaurantId) return '';
    if (typeof restaurantId === 'string') return restaurantId;
    if (restaurantId._id) return restaurantId._id.toString();
    if (typeof restaurantId.toString === 'function') return restaurantId.toString();
    return '';
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
      preparationTime?: number;
      calories?: number;
      spiceLevel?: IMenuItem['spiceLevel'];
      tags?: string[];
      allergens?: Allergen[];
      nutritionTags?: NutritionTag[];
      itemType: 'food' | 'drink';
      dietaryType?: DietaryType;
      drinkTemperature?: DrinkTemperature;
      drinkAlcoholContent?: DrinkAlcoholContent;
      drinkCaffeineContent?: DrinkCaffeineContent;
      variants?: IMenuItem['variants'];
      addons?: IMenuItem['addons'];
      customizations?: IMenuItem['customizations'];
      modifierGroups?: IMenuItem['modifierGroups'];
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

    // Validate item type specific fields
    if (data.itemType === 'food' && !data.dietaryType) {
      throw new AppError('Dietary type is required for food items', 400);
    }

    // Get next display order if not provided
    let displayOrder = data.displayOrder;
    if (displayOrder === undefined) {
      const count = await this.menuItemRepo.countByCategory(data.categoryId);
      displayOrder = count;
    }

    const menuItemData: Partial<IMenuItem> = {
      restaurantId: new Types.ObjectId(restaurantId),
      categoryId: new Types.ObjectId(data.categoryId),
      name: data.name,
      description: data.description,
      image: data.image,
      images: data.images || [],
      price: data.price,
      discountPrice: data.discountPrice,
      preparationTime: data.preparationTime,
      calories: data.calories,
      spiceLevel: data.spiceLevel,
      tags: data.tags || [],
      allergens: data.allergens || [],
      nutritionTags: data.nutritionTags || [],
      itemType: data.itemType,
      dietaryType: data.itemType === 'food' ? data.dietaryType : undefined,
      drinkTemperature: data.itemType === 'drink' ? data.drinkTemperature : undefined,
      drinkAlcoholContent: data.itemType === 'drink' ? data.drinkAlcoholContent : undefined,
      drinkCaffeineContent: data.itemType === 'drink' ? data.drinkCaffeineContent : undefined,
      variants: data.variants || [],
      addons: data.addons || [],
      customizations: data.customizations || [],
      modifierGroups: data.modifierGroups || [],
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
    const [menuData, categories] = await Promise.all([
      this.menuItemRepo.findByRestaurant(restaurantId, filter, page, limit),
      this.categoryRepo.findAllForMenu(restaurantId),
    ]);

    return {
      ...menuData,
      categories,
    };
  }

  async getAllMenuItemsForMenu(restaurantId: string) {
    const items = await this.menuItemRepo.findAllForMenu(restaurantId);
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

    const itemRestaurantId = this.extractRestaurantId(menuItem.restaurantId);
    const requestRestaurantId = restaurantId.toString();

    if (itemRestaurantId !== requestRestaurantId) {
      throw new AppError('Menu item does not belong to this restaurant', 403);
    }

    // Validate item type changes
    if (data.itemType && data.itemType !== menuItem.itemType) {
      if (data.itemType === 'food' && !data.dietaryType) {
        throw new AppError('Dietary type is required for food items', 400);
      }
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

    const itemRestaurantId = this.extractRestaurantId(menuItem.restaurantId);
    const requestRestaurantId = restaurantId.toString();

    if (itemRestaurantId !== requestRestaurantId) {
      throw new AppError('Menu item does not belong to this restaurant', 403);
    }

    const updatedMenuItem = await this.menuItemRepo.updateAvailability(id, isAvailable);
    if (!updatedMenuItem) {
      throw new AppError('Failed to update availability', 500);
    }

    return updatedMenuItem;
  }


  async deleteMenuItem(id: string, restaurantId: string): Promise<IMenuItem> {
    const menuItem = await this.menuItemRepo.findById(id);
    if (!menuItem) {
      throw new AppError('Menu item not found', 404);
    }

    const itemRestaurantId = this.extractRestaurantId(menuItem.restaurantId);
    const requestRestaurantId = restaurantId.toString();

    if (itemRestaurantId !== requestRestaurantId) {
      throw new AppError('Menu item does not belong to this restaurant', 403);
    }

    const deletedMenuItem = await this.menuItemRepo.softDelete(id);
    if (!deletedMenuItem) {
      throw new AppError('Failed to delete menu item', 500);
    }

    return deletedMenuItem;
  }
}
