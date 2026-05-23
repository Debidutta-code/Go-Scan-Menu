import { MenuItem, IMenuItem } from '../models/menu-item.model';

export class MenuItemRepository {
  async create(data: Partial<IMenuItem>): Promise<IMenuItem> {
    return MenuItem.create(data);
  }

  async findById(id: string): Promise<IMenuItem | null> {
    return MenuItem.findById(id).populate('categoryId');
  }

  async findAllForMenu(restaurantId: string): Promise<IMenuItem[]> {
    return MenuItem.find({ restaurantId, isActive: true, isAvailable: true })
      .populate('categoryId')
      .sort({ displayOrder: 1 });
  }

  async findAll(restaurantId: string): Promise<IMenuItem[]> {
    return MenuItem.find({ restaurantId }).populate('categoryId').sort({ displayOrder: 1 });
  }

  async update(id: string, data: Partial<IMenuItem>): Promise<IMenuItem | null> {
    return MenuItem.findByIdAndUpdate(id, data, { new: true }).populate('categoryId');
  }

  async delete(id: string): Promise<IMenuItem | null> {
    return MenuItem.findByIdAndUpdate(id, { isActive: false }, { new: true });
  }
}
