// src/repositories/category.repository.ts
import { Category, ICategory } from '../models/category.model';
import { Types } from 'mongoose';

export class CategoryRepository {
  async create(data: Partial<ICategory>): Promise<ICategory> {
    const category = await Category.create(data);
    return category;
  }

  async findById(id: string, populate: boolean = true): Promise<ICategory | null> {
    const query = Category.findById(id);

    if (populate) {
      return query.populate('restaurantId');
    }

    return query;
  }

  async findByRestaurant(
    restaurantId: string,
    page: number = 1,
    limit: number = 50
  ) {
    const skip = (page - 1) * limit;
    const query = { restaurantId, isActive: true };

    const [categories, total] = await Promise.all([
      Category.find(query).skip(skip).limit(limit).sort({ displayOrder: 1, name: 1 }),
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

  async findAllForMenu(restaurantId: string) {
    const query: any = {
      restaurantId,
      isActive: true,
    };

    return Category.find(query).sort({ displayOrder: 1, name: 1 });
  }

  async update(id: string, data: Partial<ICategory>): Promise<ICategory | null> {
    return Category.findByIdAndUpdate(id, data, { new: true })
      .populate('restaurantId');
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

  async countByRestaurant(restaurantId: string): Promise<number> {
    const query: any = { restaurantId, isActive: true };
    return Category.countDocuments(query);
  }
}
