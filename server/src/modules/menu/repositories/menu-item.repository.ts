// src/repositories/menuitem.repository.ts
import { MenuItem, IMenuItem } from '../models/menu-item.model';
import { Types } from 'mongoose';

export class MenuItemRepository {
  async create(data: Partial<IMenuItem>): Promise<IMenuItem> {
    const menuItem = await MenuItem.create(data);
    return menuItem;
  }

  async findById(id: string): Promise<IMenuItem | null> {
    return MenuItem.findById(id)
      .populate('restaurantId')
      .populate('categoryId');
  }

  async findByCategory(categoryId: string, page: number = 1, limit: number = 50) {
    const skip = (page - 1) * limit;
    const query = { categoryId, isActive: true };

    const [items, total] = await Promise.all([
      MenuItem.find(query)
        .populate('categoryId')
        .skip(skip)
        .limit(limit)
        .sort({ displayOrder: 1, name: 1 }),
      MenuItem.countDocuments(query),
    ]);

    return {
      items,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findByRestaurant(
    restaurantId: string,
    filter: any = {},
    page: number = 1,
    limit: number = 50
  ) {
    const skip = (page - 1) * limit;
    const query = { restaurantId, isActive: true, ...filter };

    const [items, total] = await Promise.all([
      MenuItem.find(query)
        .populate('categoryId')
        .skip(skip)
        .limit(limit)
        .sort({ categoryId: 1, displayOrder: 1, name: 1 }),
      MenuItem.countDocuments(query),
    ]);

    return {
      items,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Find all menu items for customer-facing menu
   */
  async findAllForMenu(restaurantId: string) {
    const query: any = {
      restaurantId,
      isActive: true,
    };

    const items = await MenuItem.find(query)
      .populate('categoryId')
      .sort({ categoryId: 1, displayOrder: 1, name: 1 })
      .lean();

    return items;
  }

  async update(id: string, data: Partial<IMenuItem>): Promise<IMenuItem | null> {
    return MenuItem.findByIdAndUpdate(id, data, { new: true })
      .populate('restaurantId')
      .populate('categoryId');
  }

  async updateAvailability(id: string, isAvailable: boolean): Promise<IMenuItem | null> {
    return MenuItem.findByIdAndUpdate(id, { isAvailable }, { new: true });
  }

  async softDelete(id: string): Promise<IMenuItem | null> {
    return MenuItem.findByIdAndUpdate(id, { isActive: false }, { new: true });
  }

  async hardDelete(id: string): Promise<IMenuItem | null> {
    return MenuItem.findByIdAndDelete(id);
  }

  async countByRestaurant(restaurantId: string): Promise<number> {
    const query: any = { restaurantId, isActive: true };
    return MenuItem.countDocuments(query);
  }

  async countByCategory(categoryId: string): Promise<number> {
    return MenuItem.countDocuments({ categoryId, isActive: true });
  }

  /**
   * Check if any menu items belong to a category
   * Used for cascade delete validation
   */
  async existsByCategory(categoryId: string): Promise<boolean> {
    const count = await this.countByCategory(categoryId);
    return count > 0;
  }

  /**
   * Reassign all items from one category to another
   * Used when merging or reorganizing categories
   */
  async reassignCategory(oldCategoryId: string, newCategoryId: string): Promise<number> {
    const result = await MenuItem.updateMany(
      { categoryId: oldCategoryId, isActive: true },
      { $set: { categoryId: new Types.ObjectId(newCategoryId) } }
    );
    return result.modifiedCount;
  }

}
