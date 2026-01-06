// src/repositories/role.repository.ts
import { Role, IRole } from '@/models/Role.model';
// import FilterQuery from 'mongoose';

export class RoleRepository {
  async create(data: Partial<IRole>): Promise<IRole> {
    const role = new Role(data);
    return await role.save();
  }

  async findById(id: string): Promise<IRole | null> {
    return await Role.findById(id);
  }

  async findByName(name: string, restaurantId?: string): Promise<IRole | null> {
    return await Role.findOne({
      name,
      restaurantId: restaurantId || null,
      isActive: true
    });
  }

  async findAll(filter: any = {}): Promise<IRole[]> {
    return await Role.find({ ...filter, isActive: true }).sort({ name: 1 });
  }

  async findSystemRoles(): Promise<IRole[]> {
    return await Role.find({ isSystemRole: true, isActive: true }).sort({ name: 1 });
  }

  async update(id: string, data: Partial<IRole>): Promise<IRole | null> {
    return await Role.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true, runValidators: true }
    );
  }

  async updatePermissions(id: string, permissions: any): Promise<IRole | null> {
    return await Role.findByIdAndUpdate(
      id,
      { $set: { permissions } },
      { new: true, runValidators: true }
    );
  }

  async delete(id: string): Promise<IRole | null> {
    return await Role.findByIdAndUpdate(
      id,
      { $set: { isActive: false } },
      { new: true }
    );
  }

  async count(filter: any = {}): Promise<number> {
    return await Role.countDocuments({ ...filter, isActive: true });
  }

  async exists(name: string): Promise<boolean> {
    const role = await Role.findOne({ name });
    return !!role;
  }
}
