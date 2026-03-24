import { KOT, IKOT } from '../models/kot.model';
import { Types } from 'mongoose';

export class KOTRepository {
  async create(data: Partial<IKOT>): Promise<IKOT> {
    return KOT.create(data);
  }

  async findById(id: string): Promise<IKOT | null> {
    return KOT.findById(id).populate('orderId');
  }

  async findByOrderId(orderId: string): Promise<IKOT | null> {
    return KOT.findOne({ orderId: new Types.ObjectId(orderId) });
  }

  async findByBranchId(branchId: string): Promise<IKOT[]> {
    return KOT.find({ branchId: new Types.ObjectId(branchId) }).sort({ createdAt: -1 });
  }

  async countTodayKOTs(branchId: string): Promise<number> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return KOT.countDocuments({
      branchId: new Types.ObjectId(branchId),
      createdAt: { $gte: today },
    });
  }

  async updateStatus(id: string, status: IKOT['status']): Promise<IKOT | null> {
    return KOT.findByIdAndUpdate(id, { status }, { new: true });
  }
}
