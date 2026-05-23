import { StaffRepository } from '../repositories/staff.repository';
import { IStaff } from '../models/staff.model';
import bcrypt from 'bcryptjs';
import { AppError } from '@/utils';

export class StaffService {
  private staffRepo: StaffRepository;

  constructor() {
    this.staffRepo = new StaffRepository();
  }

  async createStaff(data: Partial<IStaff>): Promise<IStaff> {
    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    }
    return this.staffRepo.create(data);
  }

  async getStaffById(id: string): Promise<IStaff | null> {
    return this.staffRepo.findById(id);
  }

  async getStaffByEmail(email: string): Promise<IStaff | null> {
    return this.staffRepo.findByEmail(email);
  }

  async updateStaff(id: string, data: Partial<IStaff>): Promise<IStaff | null> {
    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    }
    return this.staffRepo.update(id, data);
  }

  async deleteStaff(id: string): Promise<IStaff | null> {
    return this.staffRepo.delete(id);
  }

  async login(email: string, password: string): Promise<{ staff: IStaff; token: string } | null> {
      // Mock login for now or implement properly if needed
      return null;
  }
}
