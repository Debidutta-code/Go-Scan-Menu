// Updated Staff Service - Staff Type Based System
import { StaffRepository } from '@/repositories/staff.repository';
import { RestaurantRepository } from '@/repositories/restaurant.repository';
import { StaffTypePermissionsRepository } from '@/repositories/staffTypePermissions.repository';
import { IStaff } from '@/models/Staff.model';
import { StaffType } from '@/models/StaffTypePermissions.model';
import { BcryptUtil, JWTUtil } from '@/utils';
import { AppError } from '@/utils/AppError';

export class StaffService {
  private staffRepo: StaffRepository;
  private restaurantRepo: RestaurantRepository;
  private permissionsRepo: StaffTypePermissionsRepository;

  constructor() {
    this.staffRepo = new StaffRepository();
    this.restaurantRepo = new RestaurantRepository();
    this.permissionsRepo = new StaffTypePermissionsRepository();
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

    // Get permissions for staff type
    const restaurantIdValue = staff.restaurantId as any;
    const restaurantId = typeof restaurantIdValue === 'object' && restaurantIdValue?._id 
      ? restaurantIdValue._id.toString() 
      : staff.restaurantId.toString();

    const staffTypePermissions = await this.permissionsRepo.findByRestaurantAndStaffType(
      restaurantId,
      staff.staffType
    );

    // Default permissions if not found
    const permissions = staffTypePermissions?.permissions || {
      orders: { view: false, create: false, update: false, delete: false, managePayment: false, viewAllBranches: false },
      menu: { view: false, create: false, update: false, delete: false, manageCategories: false, managePricing: false },
      staff: { view: false, create: false, update: false, delete: false, manageRoles: false },
      reports: { view: false, export: false, viewFinancials: false },
      settings: { view: false, updateRestaurant: false, updateBranch: false, manageTaxes: false },
      tables: { view: false, create: false, update: false, delete: false, manageQR: false },
      customers: { view: false, manage: false },
    };

    const branchIdValue = staff.branchId as any;
    const branchId = branchIdValue ? 
      (typeof branchIdValue === 'object' && branchIdValue?._id 
        ? branchIdValue._id.toString() 
        : branchIdValue.toString())
      : undefined;

    const allowedBranchIds = staff.allowedBranchIds.map((id: any) => {
      return typeof id === 'object' && id?._id ? id._id.toString() : id.toString();
    });

    const token = JWTUtil.generateToken({
      id: staff._id.toString(),
      email: staff.email,
      staffType: staff.staffType,
      restaurantId,
      branchId,
      allowedBranchIds,
      permissions,
    });

    const staffData = staff.toObject();
    return {
      staff: {
        ...staffData,
        permissions,
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

    // Validate staff type
    if (!data.staffType) {
      throw new AppError('Staff type is required', 400);
    }

    // Validate staff type is valid
    if (!Object.values(StaffType).includes(data.staffType as StaffType)) {
      throw new AppError('Invalid staff type', 400);
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

    // Validate staff type if being updated
    if (data.staffType) {
      if (!Object.values(StaffType).includes(data.staffType as StaffType)) {
        throw new AppError('Invalid staff type', 400);
      }
    }

    const staff = await this.staffRepo.update(id, data);
    if (!staff) {
      throw new AppError('Staff not found', 404);
    }
    return staff;
  }

  async updateStaffType(id: string, staffType: StaffType) {
    // Validate staff type
    if (!Object.values(StaffType).includes(staffType)) {
      throw new AppError('Invalid staff type', 400);
    }

    const staff = await this.staffRepo.update(id, { staffType } as any);
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

