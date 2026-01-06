// Updated Staff Service - Enhanced Role System
import { StaffRepository } from '@/repositories/staff.repository';
import { RestaurantRepository } from '@/repositories/restaurant.repository';
import { RoleRepository } from '@/repositories/role.repository';
import { IStaff } from '@/models/Staff.model';
import { BcryptUtil, JWTUtil } from '@/utils';
import { AppError } from '@/utils/AppError';
import { StaffRole, AccessScope } from '@/types/role.types';

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

    // Get role information
    let role: any;
    const roleIdValue = staff.roleId as any;
    if (typeof roleIdValue === 'object' && roleIdValue !== null && roleIdValue._id) {
      role = roleIdValue;
    } else {
      role = await this.roleRepo.findById(roleIdValue.toString());
    }

    if (!role || !role.isActive) {
      throw new AppError('Role not found or inactive', 403);
    }

    // Extract ObjectIds from populated fields
    const restaurantIdValue = staff.restaurantId as any;
    const restaurantId = typeof restaurantIdValue === 'object' && restaurantIdValue?._id 
      ? restaurantIdValue._id.toString() 
      : staff.restaurantId.toString();

    const branchIdValue = staff.branchId as any;
    const branchId = branchIdValue ? 
      (typeof branchIdValue === 'object' && branchIdValue?._id 
        ? branchIdValue._id.toString() 
        : branchIdValue.toString())
      : undefined;

    // Extract ObjectIds from allowedBranchIds array
    const allowedBranchIds = staff.allowedBranchIds.map((id: any) => {
      return typeof id === 'object' && id?._id ? id._id.toString() : id.toString();
    });

    // Determine access scope from role
    const accessScope = role.accessScope || AccessScope.BRANCH_SINGLE;

    const token = JWTUtil.generateToken({
      id: staff._id.toString(),
      email: staff.email,
      role: role.name as StaffRole,
      roleId: role._id.toString(),
      restaurantId,
      branchId,
      accessScope, // Now from role instead of staff.accessLevel
      allowedBranchIds,
      permissions: role.permissions,
    });

    const staffData = staff.toObject();
    return {
      staff: {
        ...staffData,
        role: role.name,
        accessScope,
        permissions: role.permissions,
      },
      token
    };
  }

  async createStaff(data: Partial<IStaff>) {
    // Check if email already exists
    const existingStaff = await this.staffRepo.findByEmail(data.email!);
    if (existingStaff) {
      throw new AppError('Staff with this email already exists', 400);
    }

    // Validate role exists
    if (data.roleId) {
      const role = await this.roleRepo.findById(data.roleId.toString());
      if (!role || !role.isActive) {
        throw new AppError('Invalid role', 400);
      }

      // Validate role belongs to same restaurant or is a system role
      if (role.restaurantId && role.restaurantId.toString() !== data.restaurantId?.toString()) {
        throw new AppError('Role does not belong to this restaurant', 400);
      }
    } else {
      throw new AppError('Role is required', 400);
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
      if (!role || !role.isActive) {
        throw new AppError('Invalid role', 400);
      }
    }

    const staff = await this.staffRepo.update(id, data);
    if (!staff) {
      throw new AppError('Staff not found', 404);
    }
    return staff;
  }

  async updateStaffRole(id: string, roleId: string) {
    // Validate role exists
    const role = await this.roleRepo.findById(roleId);
    if (!role || !role.isActive) {
      throw new AppError('Invalid role', 400);
    }

    const staff = await this.staffRepo.update(id, { roleId: role._id } as any);
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
}
