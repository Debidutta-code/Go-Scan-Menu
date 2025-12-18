// FILE 2: src/services/superadmin.auth.service.ts
import {
  findSuperAdminByEmail,
  findSuperAdminById,
  createSuperAdmin,
  updateSuperAdminById,
  checkSuperAdminEmailExists
} from '@/repositories/superadmin.auth.repository';
import { JWTUtil, BcryptUtil } from '@/utils';

export const registerSuperAdmin = async (data: {
  name: string;
  email: string;
  password: string;
}) => {
  const existingAdmin = await findSuperAdminByEmail(data.email);
  if (existingAdmin) {
    throw new Error('Super admin with this email already exists');
  }

  const hashedPassword = await BcryptUtil.hash(data.password);

  const superAdmin = await createSuperAdmin({
    name: data.name,
    email: data.email,
    password: hashedPassword
  });

  const token = JWTUtil.generateToken({
    id: superAdmin._id.toString(),
    email: superAdmin.email,
    role: 'super_admin',
    permissions: {
      canViewOrders: true,
      canUpdateOrders: true,
      canManageMenu: true,
      canManageStaff: true,
      canViewReports: true,
      canManageSettings: true
    }
  });

  return {
    superAdmin: {
      id: superAdmin._id,
      name: superAdmin.name,
      email: superAdmin.email,
      role: superAdmin.role
    },
    token
  };
};

export const loginSuperAdmin = async (data: { email: string; password: string }) => {
  const superAdmin = await findSuperAdminByEmail(data.email);
  if (!superAdmin) {
    throw new Error('Invalid email or password');
  }

  const isPasswordValid = await BcryptUtil.compare(data.password, superAdmin.password);
  if (!isPasswordValid) {
    throw new Error('Invalid email or password');
  }

  const token = JWTUtil.generateToken({
    id: superAdmin._id.toString(),
    email: superAdmin.email,
    role: 'super_admin',
    permissions: {
      canViewOrders: true,
      canUpdateOrders: true,
      canManageMenu: true,
      canManageStaff: true,
      canViewReports: true,
      canManageSettings: true
    }
  });

  return {
    superAdmin: {
      id: superAdmin._id,
      name: superAdmin.name,
      email: superAdmin.email,
      role: superAdmin.role
    },
    token
  };
};

export const getSuperAdminProfile = async (userId: string) => {
  const superAdmin = await findSuperAdminById(userId);
  if (!superAdmin) {
    throw new Error('Super admin not found');
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
      throw new Error('Email already in use');
    }
  }

  const superAdmin = await updateSuperAdminById(userId, data);
  if (!superAdmin) {
    throw new Error('Super admin not found');
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
    throw new Error('Super admin not found');
  }

  const isPasswordValid = await BcryptUtil.compare(
    data.currentPassword,
    superAdmin.password
  );

  if (!isPasswordValid) {
    throw new Error('Current password is incorrect');
  }

  const hashedPassword = await BcryptUtil.hash(data.newPassword);
  await updateSuperAdminById(userId, { password: hashedPassword });

  return { message: 'Password changed successfully' };
};