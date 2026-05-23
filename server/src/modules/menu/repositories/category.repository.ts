import { Category, ICategory } from '../models/category.model';

export class CategoryRepository {
  async create(data: Partial<ICategory>): Promise<ICategory> {
    return Category.create(data);
  }

  async findById(id: string): Promise<ICategory | null> {
    return Category.findById(id);
  }

  async findAllForMenu(restaurantId: string): Promise<ICategory[]> {
    return Category.find({ restaurantId, isActive: true }).sort({ displayOrder: 1 });
  }

  async findAll(restaurantId: string): Promise<ICategory[]> {
    return Category.find({ restaurantId }).sort({ displayOrder: 1 });
  }

  async update(id: string, data: Partial<ICategory>): Promise<ICategory | null> {
    return Category.findByIdAndUpdate(id, data, { new: true });
  }

  async delete(id: string): Promise<ICategory | null> {
    return Category.findByIdAndUpdate(id, { isActive: false }, { new: true });
  }
}
