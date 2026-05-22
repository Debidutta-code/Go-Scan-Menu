import { ModifierOptionRepository } from '../repositories/modifier-option.repository';
import { ModifierGroupRepository } from '../repositories/modifier-group.repository';
import { IModifierOption } from '../models/modifier-option.model';
import { IModifierGroup } from '../models/modifier-group.model';
import { AppError } from '@/utils/AppError';
import { Types } from 'mongoose';

export class ModifierService {
  private optionRepo: ModifierOptionRepository;
  private groupRepo: ModifierGroupRepository;

  constructor() {
    this.optionRepo = new ModifierOptionRepository();
    this.groupRepo = new ModifierGroupRepository();
  }

  // Options
  async createOption(restaurantId: string, data: Partial<IModifierOption>) {
    return this.optionRepo.create({ ...data, restaurantId: new Types.ObjectId(restaurantId) });
  }

  async getOptionsByRestaurant(restaurantId: string) {
    return this.optionRepo.findByRestaurant(restaurantId);
  }

  async updateOption(id: string, restaurantId: string, data: Partial<IModifierOption>) {
    const option = await this.optionRepo.findById(id);
    if (!option || option.restaurantId.toString() !== restaurantId) {
      throw new AppError('Option not found', 404);
    }
    return this.optionRepo.update(id, data);
  }

  async deleteOption(id: string, restaurantId: string) {
    const option = await this.optionRepo.findById(id);
    if (!option || option.restaurantId.toString() !== restaurantId) {
      throw new AppError('Option not found', 404);
    }
    return this.optionRepo.softDelete(id);
  }

  // Groups
  async createGroup(restaurantId: string, data: Partial<IModifierGroup>) {
    return this.groupRepo.create({ ...data, restaurantId: new Types.ObjectId(restaurantId) });
  }

  async getGroupsByRestaurant(restaurantId: string) {
    return this.groupRepo.findByRestaurant(restaurantId);
  }

  async getGroupById(id: string, restaurantId: string) {
    const group = await this.groupRepo.findById(id);
    if (!group || group.restaurantId.toString() !== restaurantId) {
      throw new AppError('Modifier group not found', 404);
    }
    return group;
  }

  async updateGroup(id: string, restaurantId: string, data: Partial<IModifierGroup>) {
    const group = await this.groupRepo.findById(id);
    if (!group || group.restaurantId.toString() !== restaurantId) {
      throw new AppError('Modifier group not found', 404);
    }
    return this.groupRepo.update(id, data);
  }

  async deleteGroup(id: string, restaurantId: string) {
    const group = await this.groupRepo.findById(id);
    if (!group || group.restaurantId.toString() !== restaurantId) {
      throw new AppError('Modifier group not found', 404);
    }
    return this.groupRepo.softDelete(id);
  }
}
