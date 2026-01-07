// Staff Type Permissions Repository
import { StaffTypePermissions, IStaffTypePermissions, StaffType } from '@/models/StaffTypePermissions.model';

export class StaffTypePermissionsRepository {
  async create(data: Partial<IStaffTypePermissions>): Promise<IStaffTypePermissions> {
    const permissions = new StaffTypePermissions(data);
    return await permissions.save();
  }

  async findById(id: string): Promise<IStaffTypePermissions | null> {
    return await StaffTypePermissions.findById(id);
  }

  async findByRestaurantAndStaffType(
    restaurantId: string,
    staffType: StaffType
  ): Promise<IStaffTypePermissions | null> {
    return await StaffTypePermissions.findOne({
      restaurantId,
      staffType,
      isActive: true,
    });
  }

  async findAllByRestaurant(restaurantId: string): Promise<IStaffTypePermissions[]> {
    return await StaffTypePermissions.find({
      restaurantId,
      isActive: true,
    }).sort({ staffType: 1 });
  }

  async update(id: string, data: Partial<IStaffTypePermissions>): Promise<IStaffTypePermissions | null> {
    return await StaffTypePermissions.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true, runValidators: true }
    );
  }

  async upsert(
    restaurantId: string,
    staffType: StaffType,
    permissions: any
  ): Promise<IStaffTypePermissions> {
    return await StaffTypePermissions.findOneAndUpdate(
      { restaurantId, staffType },
      { $set: { permissions, isActive: true } },
      { new: true, upsert: true, runValidators: true }
    );
  }

  async delete(id: string): Promise<IStaffTypePermissions | null> {
    return await StaffTypePermissions.findByIdAndUpdate(
      id,
      { $set: { isActive: false } },
      { new: true }
    );
  }

  async exists(restaurantId: string, staffType: StaffType): Promise<boolean> {
    const permissions = await StaffTypePermissions.findOne({ restaurantId, staffType });
    return !!permissions;
  }
}
