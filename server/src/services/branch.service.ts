// src/services/branch.service.ts
import { BranchRepository } from '@/repositories/branch.repository';
import { RestaurantRepository } from '@/repositories/restaurant.repository';
import { IBranch } from '@/models/Branch.model';
import { AppError } from '@/utils/AppError';
import { Types } from 'mongoose';

export class BranchService {
  private branchRepo: BranchRepository;
  private restaurantRepo: RestaurantRepository;

  constructor() {
    this.branchRepo = new BranchRepository();
    this.restaurantRepo = new RestaurantRepository();
  }

  async createBranch(
    restaurantId: string,
    data: {
      name: string;
      code: string;
      email: string;
      phone: string;
      address: IBranch['address'];
      settings?: Partial<IBranch['settings']>;
    }
  ) {
    // Check if restaurant exists and is active
    const restaurant = await this.restaurantRepo.findById(restaurantId);
    if (!restaurant || !restaurant.isActive) {
      throw new AppError('Restaurant not found or inactive', 404);
    }

    // Check branch limit
    if (restaurant.subscription.currentBranches >= restaurant.subscription.maxBranches) {
      throw new AppError('Maximum branches reached for current plan', 403);
    }

    // Check unique code within restaurant
    const existingCode = await this.branchRepo.findByCodeAndRestaurant(data.code, restaurantId);
    if (existingCode) {
      throw new AppError('Branch code already exists in this restaurant', 400);
    }

    const branchData: Partial<IBranch> = {
      restaurantId: new Types.ObjectId(restaurantId),
      name: data.name,
      code: data.code.toUpperCase(),
      email: data.email,
      phone: data.phone,
      address: data.address,
      settings: {
        currency: restaurant.defaultSettings.currency,
        taxIds: restaurant.defaultSettings.defaultTaxIds,
        serviceChargePercentage: restaurant.defaultSettings.serviceChargePercentage,
        acceptOrders: true,
        operatingHours: this.getDefaultOperatingHours(),
        minOrderAmount: 0,
        deliveryAvailable: false,
        takeawayAvailable: true,
        ...data.settings,
      },
      isActive: true,
    };

    const branch = await this.branchRepo.create(branchData);

    // Increment branch count
    await this.restaurantRepo.incrementBranchCount(restaurantId);

    return branch;
  }

  async getBranch(id: string, restaurantId: string) {
    const branch = await this.branchRepo.findByIdAndRestaurant(id, restaurantId);
    if (!branch || !branch.isActive) {
      throw new AppError('Branch not found', 404);
    }
    return branch;
  }

  async getBranchesByRestaurant(restaurantId: string, page: number, limit: number, filter?: any) {
    const result = await this.branchRepo.findAllByRestaurant(restaurantId, { isActive: true, ...filter }, page, limit);
    return result;
  }

  async updateBranch(id: string, restaurantId: string, data: Partial<IBranch>) {
    const branch = await this.branchRepo.update(id, data);
    if (!branch || !branch.isActive) {
      throw new AppError('Branch not found', 404);
    }
    if (branch.restaurantId.toString() !== restaurantId) {
      throw new AppError('Branch does not belong to this restaurant', 403);
    }
    return branch;
  }

  async updateBranchSettings(id: string, restaurantId: string, settings: Partial<IBranch['settings']>) {
    const branch = await this.branchRepo.updateSettings(id, settings);
    if (!branch || !branch.isActive) {
      throw new AppError('Branch not found', 404);
    }
    if (branch.restaurantId.toString() !== restaurantId) {
      throw new AppError('Branch does not belong to this restaurant', 403);
    }
    return branch;
  }

  async assignManager(
    id: string,
    restaurantId: string,
    manager: { staffId: string; name: string; email: string; phone: string } | null
  ) {
    const managerData = manager ? { ...manager, staffId: new Types.ObjectId(manager.staffId) } : null;
    const branch = await this.branchRepo.updateManager(id, managerData);
    if (!branch || !branch.isActive) {
      throw new AppError('Branch not found', 404);
    }
    if (branch.restaurantId.toString() !== restaurantId) {
      throw new AppError('Branch does not belong to this restaurant', 403);
    }
    return branch;
  }

  async deleteBranch(id: string, restaurantId: string) {
    const branch = await this.branchRepo.findByIdAndRestaurant(id, restaurantId);
    if (!branch) {
      throw new AppError('Branch not found', 404);
    }

    await this.branchRepo.softDelete(id);

    // Decrement branch count
    await this.restaurantRepo.decrementBranchCount(restaurantId);

    return branch;
  }

  private getDefaultOperatingHours() {
    const days: Array<'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday'> = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    return days.map((day) => ({
      day,
      isOpen: true,
      openTime: '09:00',
      closeTime: day === 'friday' || day === 'saturday' ? '23:00' : '22:00',
    }));
  }
}