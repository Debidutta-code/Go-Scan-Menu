// src/services/role.service.ts
import { RoleRepository } from '@/repositories/role.repository';
import { IRole } from '@/models/Role.model';
import { AppError } from '@/utils/AppError';
import { StaffRole } from '@/types/role.types';

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

  async getRoleByName(name: string): Promise<IRole> {
    const role = await this.roleRepo.findByName(name);
    if (!role) {
      throw new AppError('Role not found', 404);
    }
    return role;
  }

  async getAllRoles(): Promise<IRole[]> {
    return await this.roleRepo.findAll();
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
      // Only allow updating permissions for system roles
      if (data.name || data.isSystemRole !== undefined) {
        throw new AppError('Cannot modify system role properties', 400);
      }
    }

    const updatedRole = await this.roleRepo.update(id, data);
    if (!updatedRole) {
      throw new AppError('Failed to update role', 500);
    }
    return updatedRole;
  }

  async updateRolePermissions(id: string, permissions: Partial<IRole['permissions']>): Promise<IRole> {
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

    // Prevent deleting system roles
    if (role.isSystemRole) {
      throw new AppError('Cannot delete system roles', 400);
    }

    const deletedRole = await this.roleRepo.delete(id);
    if (!deletedRole) {
      throw new AppError('Failed to delete role', 500);
    }
    return deletedRole;
  }

    // Seed default system roles
  async seedSystemRoles(): Promise<void> {
    const systemRoles = [
      {
        name: 'super_admin' as StaffRole,
        displayName: 'Super Admin',
        description: 'Platform administrator with full system access',
        permissions: {
          canViewOrders: true,
          canUpdateOrders: true,
          canManageMenu: true,
          canManageStaff: true,
          canViewReports: true,
          canManageSettings: true,
        },
        isSystemRole: true,
      },
      {
        name: 'owner' as StaffRole,
        displayName: 'Owner',
        description: 'Full access to all restaurant features and settings',
        permissions: {
          canViewOrders: true,
          canUpdateOrders: true,
          canManageMenu: true,
          canManageStaff: true,
          canViewReports: true,
          canManageSettings: true,
        },
        isSystemRole: true,
      },
      {
        name: 'branch_manager',
        displayName: 'Branch Manager',
        description: 'Manage branch operations, staff, and menu',
        permissions: {
          canViewOrders: true,
          canUpdateOrders: true,
          canManageMenu: true,
          canManageStaff: true,
          canViewReports: true,
          canManageSettings: false,
        },
        isSystemRole: true,
      },
      {
        name: 'manager',
        displayName: 'Manager',
        description: 'Manage daily operations, orders, and menu',
        permissions: {
          canViewOrders: true,
          canUpdateOrders: true,
          canManageMenu: true,
          canManageStaff: false,
          canViewReports: true,
          canManageSettings: false,
        },
        isSystemRole: true,
      },
      {
        name: 'waiter',
        displayName: 'Waiter',
        description: 'Take and update orders',
        permissions: {
          canViewOrders: true,
          canUpdateOrders: true,
          canManageMenu: false,
          canManageStaff: false,
          canViewReports: false,
          canManageSettings: false,
        },
        isSystemRole: true,
      },
      {
        name: 'kitchen_staff',
        displayName: 'Kitchen Staff',
        description: 'View and update order status',
        permissions: {
          canViewOrders: true,
          canUpdateOrders: true,
          canManageMenu: false,
          canManageStaff: false,
          canViewReports: false,
          canManageSettings: false,
        },
        isSystemRole: true,
      },
      {
        name: 'cashier',
        displayName: 'Cashier',
        description: 'View orders and process payments',
        permissions: {
          canViewOrders: true,
          canUpdateOrders: false,
          canManageMenu: false,
          canManageStaff: false,
          canViewReports: false,
          canManageSettings: false,
        },
        isSystemRole: true,
      },
    ];

    for (const roleData of systemRoles) {
      const exists = await this.roleRepo.exists(roleData.name);
      if (!exists) {
        await this.roleRepo.create(roleData as Partial<IRole>);
        console.log(`✅ Seeded system role: ${roleData.name}`);
      }
    }
  }
}
