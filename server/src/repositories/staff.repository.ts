// src/repositories/staff.repository.ts
import { Staff, IStaff } from '@/models/Staff.model';
import { Types } from 'mongoose';

export class StaffRepository {
  async create(data: Partial<IStaff>): Promise<IStaff> {
    const staff = await Staff.create(data);
    return staff;
  }

  async findById(id: string): Promise<IStaff | null> {
    return Staff.findById(id)
      .populate('restaurantId')
      .populate('branchId')
      .populate('allowedBranchIds');
  }

  async findByEmail(email: string): Promise<IStaff | null> {
    return Staff.findOne({ email })
      .populate('restaurantId')
      .populate('branchId')
      .populate('allowedBranchIds');
  }

  async findByRestaurant(
    restaurantId: string,
    filter: any = {},
    page: number = 1,
    limit: number = 10
  ) {
    const skip = (page - 1) * limit;
    const query = { restaurantId, ...filter };

    const [staff, total] = await Promise.all([
      Staff.find(query)
        .populate('branchId')
        .populate('allowedBranchIds')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }),
      Staff.countDocuments(query),
    ]);

    return {
      staff,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findByBranch(branchId: string, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [staff, total] = await Promise.all([
      Staff.find({ branchId })
        .populate('restaurantId')
        .populate('branchId')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }),
      Staff.countDocuments({ branchId }),
    ]);

    return {
      staff,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async update(id: string, data: Partial<IStaff>): Promise<IStaff | null> {
    return Staff.findByIdAndUpdate(id, data, { new: true })
      .populate('restaurantId')
      .populate('branchId')
      .populate('allowedBranchIds');
  }

    async delete(id: string): Promise<IStaff | null> {
    return Staff.findByIdAndUpdate(id, { isActive: false }, { new: true });
  }

  async hardDelete(id: string): Promise<IStaff | null> {
    return Staff.findByIdAndDelete(id);
  }
}
