// Updated Staff Service - Staff Type Based System
import { StaffRepository } from '../repositories/staff.repository';
import { RestaurantRepository } from '../../restaurant/repositories/restaurant.repository';
import { RoleRepository } from '../repositories/role.repository';
import { IStaff } from '../models/staff.model';
import { IRole } from '../models/role.model';
import { BcryptUtil, JWTUtil, ParamsUtil } from '@/utils';
import { AppError } from '@/utils/AppError';
import { StaffRole } from '@/types/role.types';

export class StaffService {
  private staffRepo: StaffRepository;
  private restaurantRepo: RestaurantRepository;
  private roleRepo: RoleRepository;

  constructor() {
    this.staffRepo = new StaffRepository();
    this.restaurantRepo = new RestaurantRepository();
    this.roleRepo = new RoleRepository();
  }

  private async enrichStaff(staff: IStaff) {
    // 1. Resolve Data Sources (Doc vs Object)
    const staffDoc = staff as any;
    const roleDoc = staffDoc.roleId;
    const restaurantDoc = staffDoc.restaurantId;

    // 2. Identify core auth values from ANY available source
    const roleNameRaw = roleDoc?.name || (staff as any).staffType || 'waiter';
    const roleName = roleNameRaw.toString().toLowerCase();

    let permissions = roleDoc?.permissions;
    let roleLevel = roleDoc?.level;

    // 3. Robust Fallback (Database lookup for role details if missing)
    if (!roleLevel || !permissions || Object.keys(permissions).length === 0) {
      const RoleModel = staff.model('Role');
      const foundRole = (await RoleModel.findOne({
        name: roleName,
        isSystemRole: true,
      })) as any;

      if (foundRole) {
        roleLevel = roleLevel || foundRole.level;
        permissions = permissions || foundRole.permissions;
      }
    }

    // Ensure defaults
    roleLevel = roleLevel || 5;
    permissions = permissions || {};

    // 4. Final Explicit Assembly (Avoid any Mongoose proxy behavior)
    // We normalize all IDs here to ensure they are plain strings
    const staffIdStr = ParamsUtil.extractId(staff._id);
    const restaurantIdStr = ParamsUtil.extractId(staff.restaurantId);
    const branchIdStr = ParamsUtil.extractId(staff.branchId);
    const roleIdStr = ParamsUtil.extractId(staff.roleId);
    const allowedBranchIdsStr = (staff.allowedBranchIds || []).map(id => ParamsUtil.extractId(id));

    // Resolve Restaurant Info
    let restaurantInfo = null;
    if (restaurantDoc && restaurantDoc.name) {
      restaurantInfo = {
        _id: restaurantDoc._id.toString(),
        id: restaurantDoc._id.toString(),
        name: restaurantDoc.name,
        type: restaurantDoc.type,
        slug: restaurantDoc.slug,
      };
    } else if (staff.restaurantId) {
      const restaurant = await this.restaurantRepo.findById(staff.restaurantId.toString());
      if (restaurant) {
        restaurantInfo = {
          _id: restaurant._id.toString(),
          id: restaurant._id.toString(),
          name: restaurant.name,
          type: restaurant.type,
          slug: restaurant.slug,
        };
      }
    }

    // 5. Final Explicit Assembly (Avoid any Mongoose proxy behavior)
    // This is the object that will be JSON serialized to the client
    const enriched: any = {
      _id: staffIdStr,
      id: staffIdStr,
      name: staff.name,
      email: staff.email,
      phone: staff.phone,
      isActive: staff.isActive,
      preferences: staff.preferences,
      restaurantId: restaurantIdStr,
      branchId: branchIdStr,
      allowedBranchIds: allowedBranchIdsStr,

      // KEY AUTH FIELDS (Top Level)
      roleName: roleName,
      staffType: roleName,
      roleLevel: roleLevel,
      permissions: permissions,
      restaurant: restaurantInfo,

      // Preserve Nested structure for legacy components
      roleId: {
        _id: roleIdStr,
        id: roleIdStr,
        name: roleName,
        level: roleLevel,
        permissions: permissions
      },

      createdAt: staff.createdAt,
      updatedAt: staff.updatedAt
    };

    return enriched;
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

    const enrichedStaff = await this.enrichStaff(staff);

    const token = JWTUtil.generateToken({
      id: enrichedStaff.id,
      email: enrichedStaff.email,
      role: enrichedStaff.roleName as StaffRole,
      roleId: enrichedStaff.roleId.id,
      restaurantId: enrichedStaff.restaurantId,
      branchId: enrichedStaff.branchId,
      allowedBranchIds: enrichedStaff.allowedBranchIds,
      permissions: enrichedStaff.permissions,
    });

    return {
      staff: enrichedStaff,
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
      throw new AppError('Role ID is required', 400);
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
    return this.enrichStaff(staff);
  }

  async getProfile(id: string) {
    const staff = await this.staffRepo.findById(id);
    if (!staff) {
      throw new AppError('Staff not found', 404);
    }
    return this.enrichStaff(staff);
  }

  async getStaffByRestaurant(restaurantId: string, filter: any, page: number, limit: number) {
    const result = await this.staffRepo.findByRestaurant(restaurantId, filter, page, limit);
    const enrichedStaff = await Promise.all(result.staff.map((s) => this.enrichStaff(s)));
    return {
      ...result,
      staff: enrichedStaff,
    };
  }

  async getStaffByBranch(branchId: string, page: number, limit: number) {
    const result = await this.staffRepo.findByBranch(branchId, page, limit);
    const enrichedStaff = await Promise.all(result.staff.map((s) => this.enrichStaff(s)));
    return {
      ...result,
      staff: enrichedStaff,
    };
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
    const staff = await this.staffRepo.update(id, { roleId: roleId as any });
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
