// FILE 8: src/repositories/superadmin.auth.repository.ts
import { SuperAdmin, ISuperAdmin } from '@/models';

export class SuperAdminAuthRepository {
  async findByEmail(email: string): Promise<ISuperAdmin | null> {
    return SuperAdmin.findOne({ email });
  }

  async findById(id: string): Promise<ISuperAdmin | null> {
    return SuperAdmin.findById(id).select('-password');
  }

  async create(data: {
    name: string;
    email: string;
    password: string;
  }): Promise<ISuperAdmin> {
    return SuperAdmin.create(data);
  }

  async updateById(
    id: string,
    data: Partial<Pick<ISuperAdmin, 'name' | 'email' | 'password'>>
  ): Promise<ISuperAdmin | null> {
    return SuperAdmin.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true
    }).select('-password');
  }

  async checkEmailExists(email: string, excludeId?: string): Promise<boolean> {
    const query: any = { email };
    if (excludeId) {
      query._id = { $ne: excludeId };
    }
    const count = await SuperAdmin.countDocuments(query);
    return count > 0;
  }
}