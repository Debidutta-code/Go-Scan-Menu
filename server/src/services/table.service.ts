// src/services/table.service.ts
import { TableRepository } from '@/repositories/table.repository';
import { BranchRepository } from '@/repositories/branch.repository';
import { ITable } from '@/models/Table.model';
import { AppError } from '@/utils/AppError';
import { Types } from 'mongoose';
import { nanoid } from 'nanoid';

export class TableService {
  private tableRepo: TableRepository;
  private branchRepo: BranchRepository;

  constructor() {
    this.tableRepo = new TableRepository();
    this.branchRepo = new BranchRepository();
  }

  async createTable(
    restaurantId: string,
    branchId: string,
    data: {
      tableNumber: string;
      capacity: number;
      location?: ITable['location'];
    }
  ) {
    // Check if branch exists
    const branch = await this.branchRepo.findByIdAndRestaurant(branchId, restaurantId);
    if (!branch || !branch.isActive) {
      throw new AppError('Branch not found or inactive', 404);
    }

    // Check if table number already exists in this branch
    const existingTable = await this.tableRepo.findByTableNumber(branchId, data.tableNumber);
    if (existingTable) {
      throw new AppError('Table number already exists in this branch', 400);
    }

    // Generate unique QR code
    const qrCode = `${restaurantId}-${branchId}-${nanoid(10)}`;

    const tableData: Partial<ITable> = {
      restaurantId: new Types.ObjectId(restaurantId),
      branchId: new Types.ObjectId(branchId),
      tableNumber: data.tableNumber,
      qrCode,
      capacity: data.capacity,
      location: data.location || 'indoor',
      status: 'available',
      isActive: true,
    };

    const table = await this.tableRepo.create(tableData);
    return table;
  }

  async getTable(id: string): Promise<ITable> {
    const table = await this.tableRepo.findById(id);
    if (!table || !table.isActive) {
      throw new AppError('Table not found', 404);
    }
    return table;
  }

  async getTableByQrCode(qrCode: string): Promise<ITable> {
    const table = await this.tableRepo.findByQrCode(qrCode);
    if (!table || !table.isActive) {
      throw new AppError('Table not found', 404);
    }
    return table;
  }

  async getTablesByBranch(branchId: string, page: number = 1, limit: number = 10, filter?: any) {
    return this.tableRepo.findByBranch(branchId, filter, page, limit);
  }

  async getTablesByRestaurant(
    restaurantId: string,
    page: number = 1,
    limit: number = 10,
    filter?: any
  ) {
    return this.tableRepo.findByRestaurant(restaurantId, filter, page, limit);
  }

  async updateTable(id: string, restaurantId: string, data: Partial<ITable>): Promise<ITable> {
    const table = await this.tableRepo.findById(id);
    if (!table || !table.isActive) {
      throw new AppError('Table not found', 404);
    }

    if (table.restaurantId.toString() !== restaurantId) {
      throw new AppError('Table does not belong to this restaurant', 403);
    }

    // If updating table number, check uniqueness
    if (data.tableNumber && data.tableNumber !== table.tableNumber) {
      const existingTable = await this.tableRepo.findByTableNumber(
        table.branchId.toString(),
        data.tableNumber
      );
      if (existingTable) {
        throw new AppError('Table number already exists in this branch', 400);
      }
    }

    const updatedTable = await this.tableRepo.update(id, data);
    if (!updatedTable) {
      throw new AppError('Failed to update table', 500);
    }

    return updatedTable;
  }

  async updateTableStatus(id: string, status: ITable['status']): Promise<ITable> {
    const table = await this.tableRepo.findById(id);
    if (!table || !table.isActive) {
      throw new AppError('Table not found', 404);
    }

    const updatedTable = await this.tableRepo.updateStatus(id, status);
    if (!updatedTable) {
      throw new AppError('Failed to update table status', 500);
    }

    return updatedTable;
  }

  async deleteTable(id: string, restaurantId: string): Promise<ITable> {
    const table = await this.tableRepo.findById(id);
    if (!table) {
      throw new AppError('Table not found', 404);
    }

    if (table.restaurantId.toString() !== restaurantId) {
      throw new AppError('Table does not belong to this restaurant', 403);
    }

    const deletedTable = await this.tableRepo.softDelete(id);
    if (!deletedTable) {
      throw new AppError('Failed to delete table', 500);
    }

    return deletedTable;
  }

  async regenerateQrCode(id: string, restaurantId: string): Promise<ITable> {
    const table = await this.tableRepo.findById(id);
    if (!table || !table.isActive) {
      throw new AppError('Table not found', 404);
    }

    if (table.restaurantId.toString() !== restaurantId) {
      throw new AppError('Table does not belong to this restaurant', 403);
    }

    const newQrCode = `${restaurantId}-${table.branchId.toString()}-${nanoid(10)}`;

    const updatedTable = await this.tableRepo.update(id, { qrCode: newQrCode });
    if (!updatedTable) {
      throw new AppError('Failed to regenerate QR code', 500);
    }

    return updatedTable;
  }
}
