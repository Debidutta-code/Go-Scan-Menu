// server/src/modules/auth/auth.service.ts
import {
  findSuperAdminByEmail,
  findSuperAdminById,
  createSuperAdmin,
  updateSuperAdminById,
  checkSuperAdminEmailExists,
} from './auth.repository';
import { JWTUtil, BcryptUtil, AppError } from '@/utils';
import { StaffRole } from '@/types/role.types';

export const registerSuperAdmin = async (data: {
  name: string;
  email: string;
  password: string;
}) => {
  const existingAdmin = await findSuperAdminByEmail(data.email);
  if (existingAdmin) {
    throw new AppError('Super admin with this email already exists', 400);
  }

  const hashedPassword = await BcryptUtil.hash(data.password);

  const superAdmin = await createSuperAdmin({
    name: data.name,
    email: data.email,
    password: hashedPassword,
  });

  const token = JWTUtil.generateToken({
    id: superAdmin._id.toString(),
    email: superAdmin.email,
    role: StaffRole.SUPER_ADMIN,
    permissions: superAdmin.permissions,
  });

  return {
    superAdmin: {
      id: superAdmin._id,
      name: superAdmin.name,
      email: superAdmin.email,
      role: StaffRole.SUPER_ADMIN,
      permissions: superAdmin.permissions,
    },
    token,
  };
};

export const loginSuperAdmin = async (data: { email: string; password: string }) => {
  const superAdmin = await findSuperAdminByEmail(data.email);
  if (!superAdmin || !superAdmin.isActive) {
    throw new AppError('Invalid email or password', 401);
  }

  const isPasswordValid = await BcryptUtil.compare(data.password, superAdmin.password);
  if (!isPasswordValid) {
    throw new AppError('Invalid email or password', 401);
  }

  const token = JWTUtil.generateToken({
    id: superAdmin._id.toString(),
    email: superAdmin.email,
    role: StaffRole.SUPER_ADMIN,
    permissions: superAdmin.permissions,
  });

  return {
    superAdmin: {
      id: superAdmin._id,
      name: superAdmin.name,
      email: superAdmin.email,
      role: StaffRole.SUPER_ADMIN,
      permissions: superAdmin.permissions,
    },
    token,
  };
};

export const getSuperAdminProfile = async (userId: string) => {
  const superAdmin = await findSuperAdminById(userId);
  if (!superAdmin) {
    throw new AppError('Super admin not found', 404);
  }
  return superAdmin;
};

export const updateSuperAdminProfile = async (
  userId: string,
  data: { name?: string; email?: string }
) => {
  if (data.email) {
    const emailExists = await checkSuperAdminEmailExists(data.email, userId);
    if (emailExists) {
      throw new AppError('Email already in use', 400);
    }
  }

  const superAdmin = await updateSuperAdminById(userId, data);
  if (!superAdmin) {
    throw new AppError('Super admin not found', 404);
  }

  return superAdmin;
};

export const changeSuperAdminPassword = async (
  userId: string,
  data: { currentPassword: string; newPassword: string }
) => {
  const profile = await findSuperAdminById(userId);
  const superAdmin = await findSuperAdminByEmail(profile?.email || '');

  if (!superAdmin) {
    throw new AppError('Super admin not found', 404);
  }

  const isPasswordValid = await BcryptUtil.compare(data.currentPassword, superAdmin.password);

  if (!isPasswordValid) {
    throw new AppError('Current password is incorrect', 401);
  }

  const hashedPassword = await BcryptUtil.hash(data.newPassword);
  await updateSuperAdminById(userId, { password: hashedPassword });

  return { message: 'Password changed successfully' };
};
