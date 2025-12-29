// src/repositories/customersession.repository.ts
import { CustomerSession, ICustomerSession } from '@/models/CustomerSession.model';
import { Types } from 'mongoose';

export class CustomerSessionRepository {
  async create(data: Partial<ICustomerSession>): Promise<ICustomerSession> {
    const session = await CustomerSession.create(data);
    return session;
  }

  async findById(id: string): Promise<ICustomerSession | null> {
    return CustomerSession.findById(id)
      .populate('restaurantId')
      .populate('branchId')
      .populate('tableId')
      .populate('activeOrderId');
  }

  async findBySessionId(sessionId: string): Promise<ICustomerSession | null> {
    return CustomerSession.findOne({ sessionId })
      .populate('restaurantId')
      .populate('branchId')
      .populate('tableId')
      .populate('activeOrderId');
  }

  async findActiveSessionByTable(tableId: string): Promise<ICustomerSession | null> {
    return CustomerSession.findOne({ tableId, isActive: true })
      .populate('restaurantId')
      .populate('branchId')
      .populate('tableId')
      .populate('activeOrderId');
  }

  async findActiveSessionsByBranch(branchId: string, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const [sessions, total] = await Promise.all([
      CustomerSession.find({ branchId, isActive: true })
        .populate('tableId')
        .populate('activeOrderId')
        .skip(skip)
        .limit(limit)
        .sort({ startTime: -1 }),
      CustomerSession.countDocuments({ branchId, isActive: true }),
    ]);

    return {
      sessions,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async update(
    sessionId: string,
    data: Partial<ICustomerSession>
  ): Promise<ICustomerSession | null> {
    return CustomerSession.findOneAndUpdate({ sessionId }, data, { new: true })
      .populate('restaurantId')
      .populate('branchId')
      .populate('tableId')
      .populate('activeOrderId');
  }

  async endInactiveSessions(cutoffTime: Date): Promise<number> {
    const result = await CustomerSession.updateMany(
      {
        isActive: true,
        lastActivityTime: { $lt: cutoffTime },
      },
      {
        $set: {
          isActive: false,
          endTime: new Date(),
        },
      }
    );

    return result.modifiedCount;
  }

  async delete(id: string): Promise<ICustomerSession | null> {
    return CustomerSession.findByIdAndDelete(id);
  }
}
