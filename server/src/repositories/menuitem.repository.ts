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

  async findAllForMenu(restaurantId: string, branchId?: string) {
    const query: any = {
      restaurantId,
      isActive: true,
      isAvailable: true,
      $or: [{ scope: 'restaurant', branchId: { $exists: false } }],
    };

    if (branchId) {
      query.$or.push({ scope: 'branch', branchId });
    }

    return MenuItem.find(query)
      .populate('categoryId')
      .sort({ categoryId: 1, displayOrder: 1, name: 1 });
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
}
