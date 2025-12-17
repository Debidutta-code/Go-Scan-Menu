// FILE 1: src/repositories/superadmin.auth.repository.ts
import { SuperAdmin, ISuperAdmin } from '@/models';

export const findSuperAdminByEmail = async (email: string): Promise<ISuperAdmin | null> => {
  return SuperAdmin.findOne({ email });
};

export const findSuperAdminById = async (id: string): Promise<ISuperAdmin | null> => {
  return SuperAdmin.findById(id).select('-password');
};

export const createSuperAdmin = async (data: {
  name: string;
  email: string;
  password: string;
}): Promise<ISuperAdmin> => {
  return SuperAdmin.create(data);
};

export const updateSuperAdminById = async (
  id: string,
  data: Partial<Pick<ISuperAdmin, 'name' | 'email' | 'password'>>
): Promise<ISuperAdmin | null> => {
  return SuperAdmin.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true
  }).select('-password');
};

export const checkSuperAdminEmailExists = async (
  email: string,
  excludeId?: string
): Promise<boolean> => {
  const query: any = { email };
  if (excludeId) {
    query._id = { $ne: excludeId };
  }
  const count = await SuperAdmin.countDocuments(query);
  return count > 0;
};
