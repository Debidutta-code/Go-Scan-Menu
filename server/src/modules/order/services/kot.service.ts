import { KOTRepository } from '../repositories/kot.repository';
import { OrderRepository } from '../repositories/order.repository';
import { IKOT } from '../models/kot.model';
import { AppError } from '@/utils/AppError';
import { Types } from 'mongoose';
import { IOrder } from '../models/order.model';

export class KOTService {
  private kotRepo: KOTRepository;
  private orderRepo: OrderRepository;

  constructor() {
    this.kotRepo = new KOTRepository();
    this.orderRepo = new OrderRepository();
  }

  async getKOTByOrderId(orderId: string): Promise<IKOT> {
    const existingKOT = await this.kotRepo.findByOrderId(orderId);
    if (existingKOT) {
      return existingKOT;
    }

    const order = await this.orderRepo.findById(orderId);
    if (!order) {
      throw new AppError('Order not found', 404);
    }

    // Only allow KOT generation for orders that are confirmed or preparing/ready/served
    // Actually, according to user requirement, KOT can be printed when accepting/confirming the order.
    // If it's already confirmed, it should have been created or can be created now if not exists.

    return this.createKOTFromOrder(order);
  }

  async createKOTFromOrder(order: IOrder): Promise<IKOT> {
    const branchId = order.branchId?._id || order.branchId;
    const restaurantId = order.restaurantId?._id || order.restaurantId;

    const kotNumber = await this.generateKOTNumber(branchId.toString());

    const kotData: Partial<IKOT> = {
      restaurantId: restaurantId as any,
      branchId: branchId as any,
      orderId: order._id as any,
      kotNumber,
      orderNumber: order.orderNumber,
      tableNumber: order.tableNumber,
      customerName: order.customerName,
      items: order.items.map((item) => ({
        menuItemId: (item.menuItemId?._id || item.menuItemId) as any,
        name: item.name,
        quantity: item.quantity,
        variant: item.variant ? { name: item.variant.name } : undefined,
        addons: item.addons.map((addon) => ({ name: addon.name })),
        customizations: item.customizations.map((cust) => ({
          name: cust.name,
          value: cust.value,
        })),
        specialInstructions: item.specialInstructions,
      })),
      orderType: order.orderType,
      orderTime: order.orderTime,
      status: 'pending',
    };

    return this.kotRepo.create(kotData);
  }

  private async generateKOTNumber(branchId: string): Promise<string> {
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0].replace(/-/g, '');
    const count = await this.kotRepo.countTodayKOTs(branchId);
    const sequence = String(count + 1).padStart(4, '0');
    return `KOT-${dateStr}-${sequence}`;
  }
}
