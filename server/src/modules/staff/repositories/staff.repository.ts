import { Staff, IStaff } from '../models/staff.model';

export class StaffRepository {
  async create(data: Partial<IStaff>): Promise<IStaff> {
    return Staff.create(data);
  }

  async findById(id: string): Promise<IStaff | null> {
    return Staff.findById(id).populate('roleId');
  }

  async findByEmail(email: string): Promise<IStaff | null> {
    return Staff.findOne({ email }).populate('roleId');
  }

  async update(id: string, data: Partial<IStaff>): Promise<IStaff | null> {
    return Staff.findByIdAndUpdate(id, data, { new: true }).populate('roleId');
  }

  async delete(id: string): Promise<IStaff | null> {
    return Staff.findByIdAndUpdate(id, { isActive: false }, { new: true });
  }
}
