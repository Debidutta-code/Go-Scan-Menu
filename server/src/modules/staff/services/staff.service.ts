// Updated Staff Service - Role Based System
import { StaffRepository } from '../repositories/staff.repository';
import { RestaurantRepository } from '../../restaurant/repositories/restaurant.repository';
import { RoleRepository } from '../../rbac/repositories/role.repository';
import { IStaff } from '../models/staff.model';
import { BcryptUtil, JWTUtil, ParamsUtil } from '@/utils';
import { AppError } from '@/utils/AppError';
import { StaffRole } from '../../rbac/role.types';

export class StaffService {
  private staffRepo: StaffRepository;
  private restaurantRepo: RestaurantRepository;
  private roleRepo: RoleRepository;

  constructor() {
    this.staffRepo = new StaffRepository();
    this.restaurantRepo = new RestaurantRepository();
    this.roleRepo = new RoleRepository();
  }

  async login(email: string, password: string) {
    const staff = await this.staffRepo.findByEmail(email);

    if (!staff || !staff.isActive) {
      throw new AppError('Invalid credentials', 401);
    }

    const isPasswordValid = await BcryptUtil.compare(password, staff.password);
    if (!isPasswordValid) {
      throw new AppError('Invalid credentials', 401);
    }

    // Get role and permissions - The role might be populated already
    let role = staff.roleId as any;
    if (!role || (typeof role === 'object' && !role.isActive)) {
      // Fallback: if not populated or inactive, try fetching it
      const roleId = ParamsUtil.extractId(staff.roleId);
      if (roleId) {
        role = await this.roleRepo.findById(roleId);
      }
    }

    if (!role || !role.isActive) {
      throw new AppError('Staff role not found or inactive', 403);
    }

    const restaurantId = ParamsUtil.extractId(staff.restaurantId);
    const branchId = ParamsUtil.extractId(staff.branchId);
    const allowedBranchIds = (staff.allowedBranchIds || [])
      .map((id: any) => ParamsUtil.extractId(id))
      .filter((id): id is string => !!id);

    const token = JWTUtil.generateToken({
      id: staff._id.toString(),
      email: staff.email,
      role: role.name,
      roleId: role._id.toString(),
      restaurantId,
      branchId,
      accessScope: role.accessScope,
      allowedBranchIds,
      permissions: role.permissions,
    });

    // Get restaurant data if available
    let restaurantData = null;
    if (restaurantId) {
      const restaurant = await this.restaurantRepo.findById(restaurantId);
      if (restaurant) {
        restaurantData = {
          _id: restaurant._id.toString(),
          name: restaurant.name,
          type: restaurant.type,
          slug: restaurant.slug,
        };
      }
    }

    // If not super admin and restaurant is missing, throw error
    if (role.accessScope !== StaffRole.SUPER_ADMIN && role.name !== StaffRole.SUPER_ADMIN && !restaurantData && restaurantId) {
       throw new AppError('Restaurant not found', 404);
    }

    const staffData = staff.toObject();
    return {
      staff: {
        ...staffData,
        role: role.name,
        accessScope: role.accessScope,
        permissions: role.permissions,
        restaurant: restaurantData,
      },
      token,
    };
  }

  async createStaff(data: Partial<IStaff>) {
    // Check if email already exists
    const existingStaff = await this.staffRepo.findByEmail(data.email!);
    if (existingStaff) {
      throw new AppError('Staff with this email already exists', 400);
    }

    // Validate role
    if (!data.roleId) {
      throw new AppError('Role is required', 400);
    }

    const role = await this.roleRepo.findById(data.roleId.toString());
    if (!role) {
      throw new AppError('Invalid role', 400);
    }

    // Hash password
    if (data.password) {
      data.password = await BcryptUtil.hash(data.password);
    }

    const staff = await this.staffRepo.create(data);
    return staff;
  }

  async getStaff(id: string) {
    const staff = await this.staffRepo.findById(id);
    if (!staff) {
      throw new AppError('Staff not found', 404);
    }
    return staff;
  }

  async getStaffByRestaurant(restaurantId: string, filter: any, page: number, limit: number) {
    return this.staffRepo.findByRestaurant(restaurantId, filter, page, limit);
  }

  async getStaffByBranch(branchId: string, page: number, limit: number) {
    return this.staffRepo.findByBranch(branchId, page, limit);
  }

  async updateStaff(id: string, data: Partial<IStaff>) {
    if (data.password) {
      data.password = await BcryptUtil.hash(data.password);
    }

    // Validate role if being updated
    if (data.roleId) {
      const role = await this.roleRepo.findById(data.roleId.toString());
      if (!role) {
        throw new AppError('Invalid role', 400);
      }
    }

    const staff = await this.staffRepo.update(id, data);
    if (!staff) {
      throw new AppError('Staff not found', 404);
    }
    return staff;
  }

  async updateProfile(id: string, data: Partial<IStaff>) {
    // Only allow specific fields to be updated by the user themselves
    const allowedUpdates: Partial<IStaff> = {};
    if (data.name) allowedUpdates.name = data.name;
    if (data.phone) allowedUpdates.phone = data.phone;
    if (data.preferences) allowedUpdates.preferences = data.preferences;

    const staff = await this.staffRepo.update(id, allowedUpdates as any);
    if (!staff) {
      throw new AppError('Staff not found', 404);
    }
    return staff;
  }

  async updateStaffRole(id: string, roleId: string) {
    // Validate role
    const role = await this.roleRepo.findById(roleId);
    if (!role) {
      throw new AppError('Invalid role', 400);
    }

    const staff = await this.staffRepo.update(id, { roleId } as any);
    if (!staff) {
      throw new AppError('Staff not found', 404);
    }
    return staff;
  }

  async deleteStaff(id: string) {
    const staff = await this.staffRepo.delete(id);
    if (!staff) {
      throw new AppError('Staff not found', 404);
    }
    return staff;
  }

  async changePassword(id: string, currentPass: string, newPass: string) {
    const staff = await this.staffRepo.findById(id);
    if (!staff) {
      throw new AppError('Staff not found', 404);
    }

    const isMatch = await BcryptUtil.compare(currentPass, staff.password);
    if (!isMatch) {
      throw new AppError('Current password is incorrect', 400);
    }

    const hashed = await BcryptUtil.hash(newPass);
    const updated = await this.staffRepo.update(id, { password: hashed } as any);
    return updated;
  }
}
