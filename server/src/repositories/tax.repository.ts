// src/repositories/tax.repository.ts
import { Tax, ITax } from '@/models/Tax.model';
import { Types } from 'mongoose';

export class TaxRepository {
  async create(data: Partial<ITax>): Promise<ITax> {
    const tax = await Tax.create(data);
    return tax;
  }

  async findById(id: string): Promise<ITax | null> {
    return Tax.findById(id)
      .populate('restaurantId')
      .populate('branchId')
      .populate('conditions.specificItems')
      .populate('conditions.specificCategories');
  }

  async findByRestaurant(
    restaurantId: string,
    scope: 'restaurant' | 'branch' = 'restaurant',
    category?: string,
    page: number = 1,
    limit: number = 50
  ) {
    const skip = (page - 1) * limit;
    const query: any = { restaurantId, scope, isActive: true };

    if (category) {
      query.category = category;
    }

    const [taxes, total] = await Promise.all([
      Tax.find(query)
        .populate('branchId')
        .populate('conditions.specificItems')
        .populate('conditions.specificCategories')
        .skip(skip)
        .limit(limit)
        .sort({ displayOrder: 1, name: 1 }),
      Tax.countDocuments(query),
    ]);

    return {
      taxes,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findByBranch(branchId: string, category?: string, page: number = 1, limit: number = 50) {
    const skip = (page - 1) * limit;
    const query: any = { branchId, scope: 'branch', isActive: true };

    if (category) {
      query.category = category;
    }

    const [taxes, total] = await Promise.all([
      Tax.find(query)
        .populate('restaurantId')
        .populate('branchId')
        .populate('conditions.specificItems')
        .populate('conditions.specificCategories')
        .skip(skip)
        .limit(limit)
        .sort({ displayOrder: 1, name: 1 }),
      Tax.countDocuments(query),
    ]);

    return {
      taxes,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findApplicableTaxes(restaurantId: string, branchId?: string) {
    const query: any = {
      restaurantId,
      isActive: true,
      $or: [{ scope: 'restaurant', branchId: { $exists: false } }],
    };

    if (branchId) {
      query.$or.push({ scope: 'branch', branchId });
    }

    return Tax.find(query)
      .populate('conditions.specificItems')
      .populate('conditions.specificCategories')
      .sort({ displayOrder: 1, applicableOn: 1 });
  }

  async update(id: string, data: Partial<ITax>): Promise<ITax | null> {
    return Tax.findByIdAndUpdate(id, data, { new: true })
      .populate('restaurantId')
      .populate('branchId')
      .populate('conditions.specificItems')
      .populate('conditions.specificCategories');
  }

  async updateStatus(id: string, isActive: boolean): Promise<ITax | null> {
    return Tax.findByIdAndUpdate(id, { isActive }, { new: true });
  }

  async softDelete(id: string): Promise<ITax | null> {
    return Tax.findByIdAndUpdate(id, { isActive: false }, { new: true });
  }

  async hardDelete(id: string): Promise<ITax | null> {
    return Tax.findByIdAndDelete(id);
  }

  async countByRestaurant(restaurantId: string, scope?: 'restaurant' | 'branch'): Promise<number> {
    const query: any = { restaurantId, isActive: true };
    if (scope) query.scope = scope;
    return Tax.countDocuments(query);
  }
}
