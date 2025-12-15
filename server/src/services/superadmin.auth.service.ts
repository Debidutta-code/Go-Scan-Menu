// FILE 9: src/services/superadmin.auth.service.ts
import { SuperAdminAuthRepository } from '../repositories/superadmin.auth.repository';
import { JWTUtil, BcryptUtil } from '@/utils';

export class SuperAdminAuthService {
  private repository: SuperAdminAuthRepository;

  constructor() {
    this.repository = new SuperAdminAuthRepository();
  }

  async register(data: { name: string; email: string; password: string }) {
    const existingAdmin = await this.repository.findByEmail(data.email);
    if (existingAdmin) {
      throw new Error('Super admin with this email already exists');
    }

    const hashedPassword = await BcryptUtil.hashPassword(data.password);

    const superAdmin = await this.repository.create({
      name: data.name,
      email: data.email,
      password: hashedPassword
    });

    const token = JWTUtil.generateToken({
      id: superAdmin._id.toString(),
      email: superAdmin.email,
      role: 'super_admin'
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
  }

  async login(data: { email: string; password: string }) {
    const superAdmin = await this.repository.findByEmail(data.email);
    if (!superAdmin) {
      throw new Error('Invalid email or password');
    }

    const isPasswordValid = await BcryptUtil.comparePassword(data.password, superAdmin.password);
    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }

    const token = JWTUtil.generateToken({
      id: superAdmin._id.toString(),
      email: superAdmin.email,
      role: 'super_admin'
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
  }

  async getProfile(userId: string) {
    const superAdmin = await this.repository.findById(userId);
    if (!superAdmin) {
      throw new Error('Super admin not found');
    }
    return superAdmin;
  }

  async updateProfile(userId: string, data: { name?: string; email?: string }) {
    if (data.email) {
      const emailExists = await this.repository.checkEmailExists(data.email, userId);
      if (emailExists) {
        throw new Error('Email already in use');
      }
    }

    const superAdmin = await this.repository.updateById(userId, data);
    if (!superAdmin) {
      throw new Error('Super admin not found');
    }

    return superAdmin;
  }

  async changePassword(userId: string, data: { currentPassword: string; newPassword: string }) {
    const superAdmin = await this.repository.findByEmail(
      (await this.repository.findById(userId))?.email || ''
    );
    
    if (!superAdmin) {
      throw new Error('Super admin not found');
    }

    const isPasswordValid = await BcryptUtil.comparePassword(
      data.currentPassword,
      superAdmin.password
    );
    
    if (!isPasswordValid) {
      throw new Error('Current password is incorrect');
    }

    const hashedPassword = await BcryptUtil.hashPassword(data.newPassword);
    await this.repository.updateById(userId, { password: hashedPassword });

    return { message: 'Password changed successfully' };
  }
}