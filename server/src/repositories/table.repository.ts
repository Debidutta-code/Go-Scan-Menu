// src/repositories/table.repository.ts
import { Table, ITable } from '@/models/Table.model';
import { Types } from 'mongoose';

export class TableRepository {
  async create(data: Partial<ITable>): Promise<ITable> {
    const table = await Table.create(data);
    return table;
  }

  async findById(id: string): Promise<ITable | null> {
    return Table.findById(id).populate('restaurantId').populate('branchId');
  }

  async findByQrCode(qrCode: string): Promise<ITable | null> {
    return Table.findOne({ qrCode }).populate('restaurantId').populate('branchId');
  }

  async findByBranch(branchId: string, filter: any = {}, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;
    const query = { branchId, isActive: true, ...filter };

    const [tables, total] = await Promise.all([
      Table.find(query)
        .populate('restaurantId')
        .populate('branchId')
        .skip(skip)
        .limit(limit)
        .sort({ tableNumber: 1 }),
      Table.countDocuments(query),
    ]);

    return {
      tables,
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
    limit: number = 10
  ) {
    const skip = (page - 1) * limit;
    const query = { restaurantId, isActive: true, ...filter };

    const [tables, total] = await Promise.all([
      Table.find(query)
        .populate('branchId')
        .skip(skip)
        .limit(limit)
        .sort({ branchId: 1, tableNumber: 1 }),
      Table.countDocuments(query),
    ]);

    return {
      tables,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findByTableNumber(branchId: string, tableNumber: string): Promise<ITable | null> {
    return Table.findOne({ branchId, tableNumber });
  }

  async update(id: string, data: Partial<ITable>): Promise<ITable | null> {
    return Table.findByIdAndUpdate(id, data, { new: true })
      .populate('restaurantId')
      .populate('branchId');
  }

  async updateStatus(id: string, status: ITable['status']): Promise<ITable | null> {
    return Table.findByIdAndUpdate(id, { status }, { new: true });
  }

  async softDelete(id: string): Promise<ITable | null> {
    return Table.findByIdAndUpdate(id, { isActive: false }, { new: true });
  }

  async hardDelete(id: string): Promise<ITable | null> {
    return Table.findByIdAndDelete(id);
  }

  async countByBranch(branchId: string, filter: any = {}): Promise<number> {
    return Table.countDocuments({ branchId, isActive: true, ...filter });
  }
}
