// src/services/staff.service.ts
import { StaffRepository } from '@/repositories/staff.repository';
import { RestaurantRepository } from '@/repositories/restaurant.repository';
import { IStaff } from '@/models/Staff.model';
import { BcryptUtil, JWTUtil } from '@/utils';
import { AppError } from '@/utils/AppError';

export class StaffService {
  private staffRepo: StaffRepository;
  private restaurantRepo: RestaurantRepository;

  constructor() {
    this.staffRepo = new StaffRepository();
    this.restaurantRepo = new RestaurantRepository();
  }

  async login(email: string, password: string, restaurantId: string) {
    const staff = await this.staffRepo.findByEmail(email, restaurantId);

    if (!staff || !staff.isActive) {
      throw new AppError('Invalid credentials', 401);
    }

    const isPasswordValid = await BcryptUtil.compare(password, staff.password);
    if (!isPasswordValid) {
      throw new AppError('Invalid credentials', 401);
    }

    // Check restaurant subscription
    const restaurant = await this.restaurantRepo.findById(restaurantId);
    if (!restaurant || !restaurant.subscription.isActive) {
      throw new AppError('Restaurant subscription is inactive', 403);
    }

    const token = JWTUtil.generateToken({
      id: staff._id.toString(),
      email: staff.email,
      role: staff.role,
      restaurantId: staff.restaurantId.toString(),
      branchId: staff.branchId?.toString(),
      accessLevel: staff.accessLevel,
      allowedBranchIds: staff.allowedBranchIds.map((id) => id.toString()),
      permissions: staff.permissions,
    });

    return { staff, token };
  }

  async createStaff(data: Partial<IStaff>) {
    // Check if email already exists for this restaurant
    const existingStaff = await this.staffRepo.findByEmail(
      data.email!,
      data.restaurantId!.toString()
    );
    if (existingStaff) {
      throw new AppError('Staff with this email already exists', 400);
    }

    // Hash password
    if (data.password) {
      data.password = await BcryptUtil.hash(data.password);
    }

    // Set default permissions based on role
    if (!data.permissions) {
      data.permissions = this.getDefaultPermissions(data.role!);
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

    const staff = await this.staffRepo.update(id, data);
    if (!staff) {
      throw new AppError('Staff not found', 404);
    }
    return staff;
  }

  async updatePermissions(id: string, permissions: Partial<IStaff['permissions']>) {
    const staff = await this.staffRepo.updatePermissions(id, permissions);
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

  private getDefaultPermissions(role: string) {
    const permissionMap: Record<string, IStaff['permissions']> = {
      owner: {
        canViewOrders: true,
        canUpdateOrders: true,
        canManageMenu: true,
        canManageStaff: true,
        canViewReports: true,
        canManageSettings: true,
      },
      branch_manager: {
        canViewOrders: true,
        canUpdateOrders: true,
        canManageMenu: true,
        canManageStaff: true,
        canViewReports: true,
        canManageSettings: false,
      },
      manager: {
        canViewOrders: true,
        canUpdateOrders: true,
        canManageMenu: true,
        canManageStaff: false,
        canViewReports: true,
        canManageSettings: false,
      },
      waiter: {
        canViewOrders: true,
        canUpdateOrders: true,
        canManageMenu: false,
        canManageStaff: false,
        canViewReports: false,
        canManageSettings: false,
      },
      kitchen_staff: {
        canViewOrders: true,
        canUpdateOrders: true,
        canManageMenu: false,
        canManageStaff: false,
        canViewReports: false,
        canManageSettings: false,
      },
      cashier: {
        canViewOrders: true,
        canUpdateOrders: false,
        canManageMenu: false,
        canManageStaff: false,
        canViewReports: false,
        canManageSettings: false,
      },
    };

    return permissionMap[role] || permissionMap.waiter;
  }
}