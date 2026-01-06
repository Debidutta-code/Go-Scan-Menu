// Enhanced Role Service with Industry Standard Templates
import { RoleRepository } from '@/repositories/role.repository';
import { IRole } from '@/models/Role.model';
import { AppError } from '@/utils/AppError';
import { StaffRole, RoleLevel, AccessScope, RolePermissions } from '@/types/role.types';

export class RoleService {
  private roleRepo: RoleRepository;

  constructor() {
    this.roleRepo = new RoleRepository();
  }

  async getRole(id: string): Promise<IRole> {
    const role = await this.roleRepo.findById(id);
    if (!role) {
      throw new AppError('Role not found', 404);
    }
    return role;
  }

  async getRoleByName(name: string, restaurantId?: string): Promise<IRole> {
    const role = await this.roleRepo.findByName(name, restaurantId);
    if (!role) {
      throw new AppError('Role not found', 404);
    }
    return role;
  }

  async getAllRoles(restaurantId?: string): Promise<IRole[]> {
    return await this.roleRepo.findAll({ restaurantId: restaurantId || null });
  }

  async getSystemRoles(): Promise<IRole[]> {
    return await this.roleRepo.findSystemRoles();
  }

  async updateRole(id: string, data: Partial<IRole>): Promise<IRole> {
    const role = await this.roleRepo.findById(id);
    if (!role) {
      throw new AppError('Role not found', 404);
    }

    // Prevent updating system roles' core properties
    if (role.isSystemRole) {
      if (data.name || data.level || data.accessScope || data.isSystemRole !== undefined) {
        throw new AppError('Cannot modify system role core properties', 400);
      }
    }

    const updatedRole = await this.roleRepo.update(id, data);
    if (!updatedRole) {
      throw new AppError('Failed to update role', 500);
    }
    return updatedRole;
  }

  async updateRolePermissions(id: string, permissions: Partial<RolePermissions>): Promise<IRole> {
    const role = await this.roleRepo.findById(id);
    if (!role) {
      throw new AppError('Role not found', 404);
    }

    const updatedRole = await this.roleRepo.updatePermissions(id, permissions);
    if (!updatedRole) {
      throw new AppError('Failed to update permissions', 500);
    }
    return updatedRole;
  }

  async deleteRole(id: string): Promise<IRole> {
    const role = await this.roleRepo.findById(id);
    if (!role) {
      throw new AppError('Role not found', 404);
    }

    if (role.isSystemRole) {
      throw new AppError('Cannot delete system roles', 400);
    }

    const deletedRole = await this.roleRepo.delete(id);
    if (!deletedRole) {
      throw new AppError('Failed to delete role', 500);
    }
    return deletedRole;
  }

  // Seed Industry-Standard System Roles
  async seedSystemRoles(): Promise<void> {
    const systemRoles = [
      {
        name: StaffRole.SUPER_ADMIN,
        displayName: 'Super Admin',
        description: 'Platform administrator with full system access across all restaurants',
        level: RoleLevel.PLATFORM,
        accessScope: AccessScope.PLATFORM,
        permissions: this.getSuperAdminPermissions(),
        isSystemRole: true,
      },
      {
        name: StaffRole.OWNER,
        displayName: 'Restaurant Owner',
        description: 'Full access to all restaurant features, branches, and settings',
        level: RoleLevel.RESTAURANT,
        accessScope: AccessScope.RESTAURANT,
        permissions: this.getOwnerPermissions(),
        isSystemRole: true,
      },
      {
        name: StaffRole.BRANCH_MANAGER,
        displayName: 'Branch Manager',
        description: 'Manage operations, staff, and menu across assigned branches',
        level: RoleLevel.BRANCH_MULTI,
        accessScope: AccessScope.BRANCH_MULTI,
        permissions: this.getBranchManagerPermissions(),
        isSystemRole: true,
      },
      {
        name: StaffRole.MANAGER,
        displayName: 'Manager',
        description: 'Manage daily operations, orders, and menu for a single branch',
        level: RoleLevel.BRANCH_SINGLE,
        accessScope: AccessScope.BRANCH_SINGLE,
        permissions: this.getManagerPermissions(),
        isSystemRole: true,
      },
      {
        name: StaffRole.WAITER,
        displayName: 'Waiter',
        description: 'Take orders, update order status, and manage tables',
        level: RoleLevel.OPERATIONAL,
        accessScope: AccessScope.BRANCH_SINGLE,
        permissions: this.getWaiterPermissions(),
        isSystemRole: true,
      },
      {
        name: StaffRole.KITCHEN_STAFF,
        displayName: 'Kitchen Staff',
        description: 'View orders and update food preparation status',
        level: RoleLevel.OPERATIONAL,
        accessScope: AccessScope.BRANCH_SINGLE,
        permissions: this.getKitchenStaffPermissions(),
        isSystemRole: true,
      },
      {
        name: StaffRole.CASHIER,
        displayName: 'Cashier',
        description: 'View orders, process payments, and generate bills',
        level: RoleLevel.OPERATIONAL,
        accessScope: AccessScope.BRANCH_SINGLE,
        permissions: this.getCashierPermissions(),
        isSystemRole: true,
      },
    ];

    for (const roleData of systemRoles) {
      const exists = await this.roleRepo.exists(roleData.name);
      if (!exists) {
        await this.roleRepo.create(roleData as Partial<IRole>);
        console.log(`✅ Seeded system role: ${roleData.name}`);
      } else {
        console.log(`ℹ️  Role already exists: ${roleData.name}`);
      }
    }
  }

  // Permission Templates
  private getSuperAdminPermissions(): RolePermissions {
    return {
      orders: { view: true, create: true, update: true, delete: true, managePayment: true, viewAllBranches: true },
      menu: { view: true, create: true, update: true, delete: true, manageCategories: true, managePricing: true },
      staff: { view: true, create: true, update: true, delete: true, manageRoles: true },
      reports: { view: true, export: true, viewFinancials: true },
      settings: { view: true, updateRestaurant: true, updateBranch: true, manageTaxes: true },
      tables: { view: true, create: true, update: true, delete: true, manageQR: true },
      customers: { view: true, manage: true },
    };
  }

  private getOwnerPermissions(): RolePermissions {
    return {
      orders: { view: true, create: true, update: true, delete: true, managePayment: true, viewAllBranches: true },
      menu: { view: true, create: true, update: true, delete: true, manageCategories: true, managePricing: true },
      staff: { view: true, create: true, update: true, delete: true, manageRoles: true },
      reports: { view: true, export: true, viewFinancials: true },
      settings: { view: true, updateRestaurant: true, updateBranch: true, manageTaxes: true },
      tables: { view: true, create: true, update: true, delete: true, manageQR: true },
      customers: { view: true, manage: true },
    };
  }

  private getBranchManagerPermissions(): RolePermissions {
    return {
      orders: { view: true, create: true, update: true, delete: true, managePayment: true, viewAllBranches: false },
      menu: { view: true, create: true, update: true, delete: true, manageCategories: true, managePricing: true },
      staff: { view: true, create: true, update: true, delete: true, manageRoles: false },
      reports: { view: true, export: true, viewFinancials: true },
      settings: { view: true, updateRestaurant: false, updateBranch: true, manageTaxes: true },
      tables: { view: true, create: true, update: true, delete: true, manageQR: true },
      customers: { view: true, manage: true },
    };
  }

  private getManagerPermissions(): RolePermissions {
    return {
      orders: { view: true, create: true, update: true, delete: false, managePayment: true, viewAllBranches: false },
      menu: { view: true, create: true, update: true, delete: true, manageCategories: false, managePricing: true },
      staff: { view: true, create: false, update: false, delete: false, manageRoles: false },
      reports: { view: true, export: false, viewFinancials: false },
      settings: { view: true, updateRestaurant: false, updateBranch: true, manageTaxes: false },
      tables: { view: true, create: true, update: true, delete: false, manageQR: true },
      customers: { view: true, manage: false },
    };
  }

  private getWaiterPermissions(): RolePermissions {
    return {
      orders: { view: true, create: true, update: true, delete: false, managePayment: false, viewAllBranches: false },
      menu: { view: true, create: false, update: false, delete: false, manageCategories: false, managePricing: false },
      staff: { view: false, create: false, update: false, delete: false, manageRoles: false },
      reports: { view: false, export: false, viewFinancials: false },
      settings: { view: false, updateRestaurant: false, updateBranch: false, manageTaxes: false },
      tables: { view: true, create: false, update: true, delete: false, manageQR: false },
      customers: { view: true, manage: false },
    };
  }

  private getKitchenStaffPermissions(): RolePermissions {
    return {
      orders: { view: true, create: false, update: true, delete: false, managePayment: false, viewAllBranches: false },
      menu: { view: true, create: false, update: false, delete: false, manageCategories: false, managePricing: false },
      staff: { view: false, create: false, update: false, delete: false, manageRoles: false },
      reports: { view: false, export: false, viewFinancials: false },
      settings: { view: false, updateRestaurant: false, updateBranch: false, manageTaxes: false },
      tables: { view: true, create: false, update: false, delete: false, manageQR: false },
      customers: { view: false, manage: false },
    };
  }

  private getCashierPermissions(): RolePermissions {
    return {
      orders: { view: true, create: false, update: false, delete: false, managePayment: true, viewAllBranches: false },
      menu: { view: true, create: false, update: false, delete: false, manageCategories: false, managePricing: false },
      staff: { view: false, create: false, update: false, delete: false, manageRoles: false },
      reports: { view: false, export: false, viewFinancials: false },
      settings: { view: false, updateRestaurant: false, updateBranch: false, manageTaxes: false },
      tables: { view: true, create: false, update: false, delete: false, manageQR: false },
      customers: { view: true, manage: false },
    };
  }
}
