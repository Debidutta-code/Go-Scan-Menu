import { SuperAdmin, ISuperAdmin } from '@/models/SuperAdmin.model';

export const createSuperAdmin = async (data: {
  name: string;
  email: string;
  password: string;
  roleId: any;
}): Promise<ISuperAdmin> => {
  return SuperAdmin.create(data);
};

export const findSuperAdminByEmail = async (email: string): Promise<ISuperAdmin | null> => {
  return SuperAdmin.findOne({ email }).populate('roleId');
};

export const findSuperAdminById = async (id: string): Promise<ISuperAdmin | null> => {
  return SuperAdmin.findById(id).populate('roleId').select('-password');
};

export const updateSuperAdminById = async (
  id: string,
  data: Partial<ISuperAdmin>
): Promise<ISuperAdmin | null> => {
  return SuperAdmin.findByIdAndUpdate(id, data, { new: true }).select('-password');
};

export const checkSuperAdminEmailExists = async (
  email: string,
  excludeId?: string
): Promise<boolean> => {
  const query = excludeId ? { email, _id: { $ne: excludeId } } : { email };
  const superAdmin = await SuperAdmin.findOne(query);
  return !!superAdmin;
};