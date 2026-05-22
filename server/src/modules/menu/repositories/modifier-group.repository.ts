import { ModifierGroup, IModifierGroup } from '../models/modifier-group.model';

export class ModifierGroupRepository {
  async create(data: Partial<IModifierGroup>): Promise<IModifierGroup> {
    return ModifierGroup.create(data);
  }

  async findById(id: string): Promise<IModifierGroup | null> {
    return ModifierGroup.findById(id).populate('options');
  }

  async findByRestaurant(restaurantId: string): Promise<IModifierGroup[]> {
    return ModifierGroup.find({ restaurantId, isActive: true })
      .populate('options')
      .sort({ name: 1 });
  }

  async update(id: string, data: Partial<IModifierGroup>): Promise<IModifierGroup | null> {
    return ModifierGroup.findByIdAndUpdate(id, data, { new: true }).populate('options');
  }

  async softDelete(id: string): Promise<IModifierGroup | null> {
    return ModifierGroup.findByIdAndUpdate(id, { isActive: false }, { new: true });
  }
}
