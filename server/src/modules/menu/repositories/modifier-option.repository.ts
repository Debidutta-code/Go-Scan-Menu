import { ModifierOption, IModifierOption } from '../models/modifier-option.model';

export class ModifierOptionRepository {
  async create(data: Partial<IModifierOption>): Promise<IModifierOption> {
    return ModifierOption.create(data);
  }

  async findById(id: string): Promise<IModifierOption | null> {
    return ModifierOption.findById(id);
  }

  async findByRestaurant(restaurantId: string): Promise<IModifierOption[]> {
    return ModifierOption.find({ restaurantId, isActive: true }).sort({ name: 1 });
  }

  async update(id: string, data: Partial<IModifierOption>): Promise<IModifierOption | null> {
    return ModifierOption.findByIdAndUpdate(id, data, { new: true });
  }

  async softDelete(id: string): Promise<IModifierOption | null> {
    return ModifierOption.findByIdAndUpdate(id, { isActive: false }, { new: true });
  }
}
