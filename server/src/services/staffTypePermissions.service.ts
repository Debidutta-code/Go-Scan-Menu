// Staff Type Permissions Service
import { StaffTypePermissionsRepository } from '@/repositories/staffTypePermissions.repository';
import { IStaffTypePermissions, StaffType, IPermissions } from '@/models/StaffTypePermissions.model';
import { AppError } from '@/utils/AppError';

export class StaffTypePermissionsService {
  private permissionsRepo: StaffTypePermissionsRepository;

  constructor() {
    this.permissionsRepo = new StaffTypePermissionsRepository();
  }

  // Get permissions for a specific staff type in a restaurant
  async getPermissionsForStaffType(
    restaurantId: string,
    staffType: StaffType
  ): Promise<IStaffTypePermissions> {
    let permissions = await this.permissionsRepo.findByRestaurantAndStaffType(restaurantId, staffType);

    // If no permissions exist, create default (all disabled)
    if (!permissions) {
      permissions = await this.initializeDefaultPermissionsForType(restaurantId, staffType);
    }

    return permissions;
  }

  // Get all staff type permissions for a restaurant
  async getAllStaffTypePermissions(restaurantId: string): Promise<IStaffTypePermissions[]> {
    const existingPermissions = await this.permissionsRepo.findAllByRestaurant(restaurantId);

    // If no permissions exist, initialize for all staff types
    if (existingPermissions.length === 0) {
      await this.initializeAllDefaultPermissions(restaurantId);
      return await this.permissionsRepo.findAllByRestaurant(restaurantId);
    }

    // Check if any staff types are missing and initialize them
    const existingTypes = existingPermissions.map((p) => p.staffType);
    const allTypes = Object.values(StaffType);
    const missingTypes = allTypes.filter((type) => !existingTypes.includes(type));

    for (const type of missingTypes) {
      await this.initializeDefaultPermissionsForType(restaurantId, type);
    }

    return await this.permissionsRepo.findAllByRestaurant(restaurantId);
  }

  // Update permissions for a staff type
  async updatePermissionsForStaffType(
    restaurantId: string,
    staffType: StaffType,
    permissions: Partial<IPermissions>
  ): Promise<IStaffTypePermissions> {
    const updatedPermissions = await this.permissionsRepo.upsert(
      restaurantId,
      staffType,
      permissions
    );

    if (!updatedPermissions) {
      throw new AppError('Failed to update permissions', 500);
    }

    return updatedPermissions;
  }

  // Initialize default permissions for a specific staff type (all disabled)
  private async initializeDefaultPermissionsForType(
    restaurantId: string,
    staffType: StaffType
  ): Promise<IStaffTypePermissions> {
    const defaultPermissions: IPermissions = {
      orders: {
        view: false,
        create: false,
        update: false,
        delete: false,
        managePayment: false,
        viewAllBranches: false,
      },
      menu: {
        view: false,
        create: false,
        update: false,
        delete: false,
        manageCategories: false,
        managePricing: false,
      },
      staff: {
        view: false,
        create: false,
        update: false,
        delete: false,
        manageRoles: false,
      },
      reports: {
        view: false,
        export: false,
        viewFinancials: false,
      },
      settings: {
        view: false,
        updateRestaurant: false,
        updateBranch: false,
        manageTaxes: false,
      },
      tables: {
        view: false,
        create: false,
        update: false,
        delete: false,
        manageQR: false,
      },
      customers: {
        view: false,
        manage: false,
      },
    };

    return await this.permissionsRepo.create({
      restaurantId: restaurantId as any,
      staffType,
      permissions: defaultPermissions,
    });
  }

  // Initialize all default permissions for a restaurant
  async initializeAllDefaultPermissions(restaurantId: string): Promise<void> {
    const allTypes = Object.values(StaffType);

    for (const type of allTypes) {
      const exists = await this.permissionsRepo.exists(restaurantId, type);
      if (!exists) {
        await this.initializeDefaultPermissionsForType(restaurantId, type);
      }
    }
  }

  // Delete permissions for a staff type
  async deletePermissions(id: string): Promise<IStaffTypePermissions> {
    const permissions = await this.permissionsRepo.findById(id);
    if (!permissions) {
      throw new AppError('Permissions not found', 404);
    }

    const deleted = await this.permissionsRepo.delete(id);
    if (!deleted) {
      throw new AppError('Failed to delete permissions', 500);
    }

    return deleted;
  }
}
