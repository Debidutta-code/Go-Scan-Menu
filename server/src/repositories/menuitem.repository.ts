// src/repositories/menuitem.repository.ts
import { MenuItem, IMenuItem } from '@/models/MenuItem.model';
import { Types } from 'mongoose';

export class MenuItemRepository {
  async create(data: Partial<IMenuItem>): Promise<IMenuItem> {
    const menuItem = await MenuItem.create(data);
    return menuItem;
  }

  async findById(id: string): Promise<IMenuItem | null> {
    return MenuItem.findById(id)
      .populate('restaurantId')
      .populate('branchId')
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
        .populate('branchId')
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

  async findByBranch(branchId: string, filter: any = {}, page: number = 1, limit: number = 50) {
    const skip = (page - 1) * limit;
    const query = { branchId, scope: 'branch', isActive: true, ...filter };

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
   * Includes restaurant-wide items + branch-specific items
   * Applies branch pricing overrides where applicable
   */
  async findAllForMenu(restaurantId: string, branchId?: string) {
    const query: any = {
      restaurantId,
      isActive: true,
      isAvailable: true,
      $or: [
        // Restaurant-wide items (no branchId)
        { scope: 'restaurant', branchId: { $exists: false } },
      ],
    };

    // If querying for a specific branch, include branch-specific items
    if (branchId) {
      query.$or.push({ scope: 'branch', branchId });
    }

    const items = await MenuItem.find(query)
      .populate('categoryId')
      .sort({ categoryId: 1, displayOrder: 1, name: 1 })
      .lean(); // Use lean() for performance since we're transforming the data

    // If branchId provided, apply branch pricing overrides to restaurant-wide items
    if (branchId) {
      return items.map((item: any) => {
        // Only process restaurant-scoped items (branch-scoped items already have correct price)
        if (item.scope === 'restaurant' && item.branchPricing && item.branchPricing.length > 0) {
          const branchOverride = item.branchPricing.find(
            (bp: any) => bp.branchId.toString() === branchId
          );

          if (branchOverride) {
            return {
              ...item,
              price: branchOverride.price,
              discountPrice: branchOverride.discountPrice,
              isAvailable: branchOverride.isAvailable,
              // Keep original branchPricing for admin purposes
              _hasBranchOverride: true,
              _originalPrice: item.price,
            };
          }
        }

        return item;
      });
    }

    return items;
  }

  async update(id: string, data: Partial<IMenuItem>): Promise<IMenuItem | null> {
    return MenuItem.findByIdAndUpdate(id, data, { new: true })
      .populate('restaurantId')
      .populate('branchId')
      .populate('categoryId');
  }

  async updateAvailability(id: string, isAvailable: boolean): Promise<IMenuItem | null> {
    return MenuItem.findByIdAndUpdate(id, { isAvailable }, { new: true });
  }

  async updateBranchPricing(
    id: string,
    branchId: string,
    pricing: { price: number; discountPrice?: number; isAvailable: boolean }
  ): Promise<IMenuItem | null> {
    // First, check if branch pricing already exists
    const item = await MenuItem.findById(id);
    if (!item) return null;

    const existingIndex = item.branchPricing.findIndex((bp) => bp.branchId.toString() === branchId);

    if (existingIndex >= 0) {
      // Update existing branch pricing
      item.branchPricing[existingIndex] = {
        branchId: new Types.ObjectId(branchId),
        ...pricing,
      };
    } else {
      // Add new branch pricing
      item.branchPricing.push({
        branchId: new Types.ObjectId(branchId),
        ...pricing,
      });
    }

    return item.save();
  }

  async softDelete(id: string): Promise<IMenuItem | null> {
    return MenuItem.findByIdAndUpdate(id, { isActive: false }, { new: true });
  }

  async hardDelete(id: string): Promise<IMenuItem | null> {
    return MenuItem.findByIdAndDelete(id);
  }

  async countByRestaurant(restaurantId: string, scope?: 'restaurant' | 'branch'): Promise<number> {
    const query: any = { restaurantId, isActive: true };
    if (scope) query.scope = scope;
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

  /**
   * Get menu item with correct branch-specific pricing for order validation
   * Returns null if item is not available for the given branch
   */
  async findByIdForBranch(itemId: string, branchId: string): Promise<any | null> {
    const item = await MenuItem.findById(itemId).populate('categoryId').lean();

    if (!item || !item.isActive) {
      return null;
    }

    // Branch-scoped item: must match branchId and be available
    if (item.scope === 'branch') {
      if (item.branchId?.toString() !== branchId || !item.isAvailable) {
        return null;
      }
      return item;
    }

    // Restaurant-scoped item: check for branch override
    if (item.scope === 'restaurant') {
      const branchOverride = item.branchPricing?.find(
        (bp: any) => bp.branchId.toString() === branchId
      );

      if (branchOverride) {
        // Use branch-specific availability and pricing
        if (!branchOverride.isAvailable) {
          return null;
        }
        return {
          ...item,
          price: branchOverride.price,
          discountPrice: branchOverride.discountPrice || branchOverride.price,
          isAvailable: branchOverride.isAvailable,
        };
      }

      // No branch override, use base item (if available)
      if (!item.isAvailable) {
        return null;
      }
      return item;
    }

    return null;
  }
}
