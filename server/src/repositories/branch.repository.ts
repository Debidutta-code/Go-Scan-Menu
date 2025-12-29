// src/repositories/branch.repository.ts
import { Branch, IBranch } from '@/models/Branch.model';
import { Types } from 'mongoose';

export class BranchRepository {
  async create(data: Partial<IBranch>): Promise<IBranch> {
    const branch = await Branch.create(data);
    return branch;
  }

  async findById(id: string): Promise<IBranch | null> {
    return Branch.findById(id).populate('settings.taxIds').populate('manager.staffId');
  }

  async findByIdAndRestaurant(id: string, restaurantId: string): Promise<IBranch | null> {
    return Branch.findOne({ _id: id, restaurantId })
      .populate('settings.taxIds')
      .populate('manager.staffId');
  }

  async findByCodeAndRestaurant(code: string, restaurantId: string): Promise<IBranch | null> {
    return Branch.findOne({ code: code.toUpperCase(), restaurantId });
  }

  async findByCode(code: string): Promise<IBranch | null> {
    return Branch.findOne({ code: code.toUpperCase() })
      .populate('settings.taxIds')
      .populate('manager.staffId');
  }

  async findAllByRestaurant(
    restaurantId: string,
    filter: any = {},
    page: number = 1,
    limit: number = 10
  ) {
    const skip = (page - 1) * limit;

    const baseFilter = { restaurantId, ...filter };

    const [branches, total] = await Promise.all([
      Branch.find(baseFilter)
        .populate('settings.taxIds')
        .populate('manager.staffId')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }),
      Branch.countDocuments(baseFilter),
    ]);

    return {
      branches,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async update(id: string, data: Partial<IBranch>): Promise<IBranch | null> {
    return Branch.findByIdAndUpdate(id, data, { new: true })
      .populate('settings.taxIds')
      .populate('manager.staffId');
  }

  async updateManager(
    id: string,
    manager: Partial<IBranch['manager']> | null
  ): Promise<IBranch | null> {
    return Branch.findByIdAndUpdate(id, { $set: { manager } }, { new: true })
      .populate('settings.taxIds')
      .populate('manager.staffId');
  }

  async updateSettings(
    id: string,
    settings: Partial<IBranch['settings']>
  ): Promise<IBranch | null> {
    return Branch.findByIdAndUpdate(id, { $set: { settings } }, { new: true }).populate(
      'settings.taxIds'
    );
  }

  async softDelete(id: string): Promise<IBranch | null> {
    return Branch.findByIdAndUpdate(id, { isActive: false }, { new: true });
  }

  async delete(id: string): Promise<IBranch | null> {
    return Branch.findByIdAndDelete(id);
  }
}
