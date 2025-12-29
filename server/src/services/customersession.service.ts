// src/services/customersession.service.ts
import { CustomerSessionRepository } from '@/repositories/customersession.repository';
import { RestaurantRepository } from '@/repositories/restaurant.repository';
import { BranchRepository } from '@/repositories/branch.repository';
import { TableRepository } from '@/repositories/table.repository';
import { ICustomerSession } from '@/models/CustomerSession.model';
import { AppError } from '@/utils/AppError';
import { Types } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export class CustomerSessionService {
  private sessionRepo: CustomerSessionRepository;
  private restaurantRepo: RestaurantRepository;
  private branchRepo: BranchRepository;
  private tableRepo: TableRepository;

  constructor() {
    this.sessionRepo = new CustomerSessionRepository();
    this.restaurantRepo = new RestaurantRepository();
    this.branchRepo = new BranchRepository();
    this.tableRepo = new TableRepository();
  }

  async createSession(data: {
    restaurantId: string;
    branchId: string;
    tableId: string;
    themePreference?: 'light' | 'dark';
  }) {
    // Verify restaurant exists
    const restaurant = await this.restaurantRepo.findById(data.restaurantId);
    if (!restaurant || !restaurant.isActive) {
      throw new AppError('Restaurant not found or inactive', 404);
    }

    // Verify branch exists
    const branch = await this.branchRepo.findByIdAndRestaurant(data.branchId, data.restaurantId);
    if (!branch || !branch.isActive) {
      throw new AppError('Branch not found or inactive', 404);
    }

    // Verify table exists
    const table = await this.tableRepo.findById(data.tableId);
    if (!table || !table.isActive) {
      throw new AppError('Table not found or inactive', 404);
    }

    // Check if there's already an active session for this table
    const existingSession = await this.sessionRepo.findActiveSessionByTable(data.tableId);
    if (existingSession) {
      throw new AppError('Table already has an active session', 400);
    }

    // Generate unique session ID
    const sessionId = uuidv4();

    const sessionData: Partial<ICustomerSession> = {
      restaurantId: new Types.ObjectId(data.restaurantId),
      branchId: new Types.ObjectId(data.branchId),
      tableId: new Types.ObjectId(data.tableId),
      sessionId,
      themePreference: data.themePreference || 'light',
      startTime: new Date(),
      lastActivityTime: new Date(),
      isActive: true,
    };

    const session = await this.sessionRepo.create(sessionData);

    // Update table status to occupied
    await this.tableRepo.update(data.tableId, { status: 'occupied' });

    return session;
  }

  async getSessionBySessionId(sessionId: string): Promise<ICustomerSession> {
    const session = await this.sessionRepo.findBySessionId(sessionId);
    if (!session) {
      throw new AppError('Session not found', 404);
    }
    return session;
  }

  async getActiveSessionByTable(tableId: string): Promise<ICustomerSession | null> {
    return this.sessionRepo.findActiveSessionByTable(tableId);
  }

  async updateThemePreference(
    sessionId: string,
    themePreference: 'light' | 'dark'
  ): Promise<ICustomerSession> {
    const session = await this.sessionRepo.findBySessionId(sessionId);
    if (!session) {
      throw new AppError('Session not found', 404);
    }

    if (!session.isActive) {
      throw new AppError('Session is no longer active', 400);
    }

    const updatedSession = await this.sessionRepo.update(sessionId, {
      themePreference,
      lastActivityTime: new Date(),
    });

    if (!updatedSession) {
      throw new AppError('Failed to update theme preference', 500);
    }

    return updatedSession;
  }

  async updateActiveOrder(sessionId: string, orderId: string | null): Promise<ICustomerSession> {
    const session = await this.sessionRepo.findBySessionId(sessionId);
    if (!session) {
      throw new AppError('Session not found', 404);
    }

    if (!session.isActive) {
      throw new AppError('Session is no longer active', 400);
    }

    const updateData: any = {
      lastActivityTime: new Date(),
    };

    if (orderId) {
      updateData.activeOrderId = new Types.ObjectId(orderId);
    } else {
      updateData.activeOrderId = undefined;
    }

    const updatedSession = await this.sessionRepo.update(sessionId, updateData);

    if (!updatedSession) {
      throw new AppError('Failed to update active order', 500);
    }

    return updatedSession;
  }

  async updateActivity(sessionId: string): Promise<ICustomerSession> {
    const session = await this.sessionRepo.findBySessionId(sessionId);
    if (!session) {
      throw new AppError('Session not found', 404);
    }

    if (!session.isActive) {
      throw new AppError('Session is no longer active', 400);
    }

    const updatedSession = await this.sessionRepo.update(sessionId, {
      lastActivityTime: new Date(),
    });

    if (!updatedSession) {
      throw new AppError('Failed to update activity', 500);
    }

    return updatedSession;
  }

  async endSession(sessionId: string): Promise<ICustomerSession> {
    const session = await this.sessionRepo.findBySessionId(sessionId);
    if (!session) {
      throw new AppError('Session not found', 404);
    }

    if (!session.isActive) {
      throw new AppError('Session is already ended', 400);
    }

    const updatedSession = await this.sessionRepo.update(sessionId, {
      endTime: new Date(),
      isActive: false,
    });

    if (!updatedSession) {
      throw new AppError('Failed to end session', 500);
    }

    // Update table status back to available
    await this.tableRepo.update(session.tableId.toString(), { status: 'available' });

    return updatedSession;
  }

  async getActiveSessionsByBranch(branchId: string, page: number = 1, limit: number = 20) {
    return this.sessionRepo.findActiveSessionsByBranch(branchId, page, limit);
  }

  async cleanupInactiveSessions(inactiveMinutes: number = 120): Promise<number> {
    const cutoffTime = new Date(Date.now() - inactiveMinutes * 60 * 1000);
    return this.sessionRepo.endInactiveSessions(cutoffTime);
  }
}
