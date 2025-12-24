// src/repositories/category.repository.ts
import { Category, ICategory } from '@/models/Category.model';
import { Types } from 'mongoose';

export class CategoryRepository {
  async create(data: Partial<ICategory>): Promise<ICategory> {
    const category = await Category.create(data);
    return category;
  }

  async findById(id: string): Promise<ICategory | null> {
    return Category.findById(id).populate('restaurantId').populate('branchId');
  }

  async findByRestaurant(
    restaurantId: string,
    scope: 'restaurant' | 'branch' = 'restaurant',
    page: number = 1,
    limit: number = 50
  ) {
    const skip = (page - 1) * limit;
    const query = { restaurantId, scope, isActive: true };

    const [categories, total] = await Promise.all([
      Category.find(query)
        .skip(skip)
        .limit(limit)
        .sort({ displayOrder: 1, name: 1 }),
      Category.countDocuments(query),
    ]);

    return {
      categories,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findByBranch(
    branchId: string,
    page: number = 1,
    limit: number = 50
  ) {
    const skip = (page - 1) * limit;
    const query = { branchId, scope: 'branch', isActive: true };

    const [categories, total] = await Promise.all([
      Category.find(query)
        .populate('restaurantId')
        .populate('branchId')
        .skip(skip)
        .limit(limit)
        .sort({ displayOrder: 1, name: 1 }),
      Category.countDocuments(query),
    ]);

    return {
      categories,
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
      $or: [
        { scope: 'restaurant', branchId: { $exists: false } },
      ],
    };

    if (branchId) {
      query.$or.push({ scope: 'branch', branchId });
    }

    return Category.find(query).sort({ displayOrder: 1, name: 1 });
  }

  async update(id: string, data: Partial<ICategory>): Promise<ICategory | null> {
    return Category.findByIdAndUpdate(id, data, { new: true })
      .populate('restaurantId')
      .populate('branchId');
  }

  async updateDisplayOrder(id: string, displayOrder: number): Promise<ICategory | null> {
    return Category.findByIdAndUpdate(id, { displayOrder }, { new: true });
  }

  async softDelete(id: string): Promise<ICategory | null> {
    return Category.findByIdAndUpdate(id, { isActive: false }, { new: true });
  }

  async hardDelete(id: string): Promise<ICategory | null> {
    return Category.findByIdAndDelete(id);
  }

  async countByRestaurant(restaurantId: string, scope?: 'restaurant' | 'branch'): Promise<number> {
    const query: any = { restaurantId, isActive: true };
    if (scope) query.scope = scope;
    return Category.countDocuments(query);
  }
}