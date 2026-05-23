// src/services/tax.service.ts
import { TaxRepository } from '../repositories/tax.repository';
import { RestaurantRepository } from '../repositories/restaurant.repository';
import { ITax } from '../models/tax.model';
import { AppError } from '@/utils/AppError';
import { Types } from 'mongoose';
import { ParamsUtil } from '@/utils/params.util';
import { CreateTaxDTO, UpdateTaxDTO } from '@/types/tax.types';

export class TaxService {
  private taxRepo: TaxRepository;
  private restaurantRepo: RestaurantRepository;

  constructor() {
    this.taxRepo = new TaxRepository();
    this.restaurantRepo = new RestaurantRepository();
  }

  async createTax(restaurantId: string, data: CreateTaxDTO) {
    // Verify restaurant exists
    const restaurant = await this.restaurantRepo.findById(restaurantId);
    if (!restaurant || !restaurant.isActive) {
      throw new AppError('Restaurant not found or inactive', 404);
    }

    // If parentId provided, verify it exists and is a group
    if (data.parentId) {
      const parent = await this.taxRepo.findById(data.parentId);
      if (!parent || !parent.isActive) {
        throw new AppError('Parent tax group not found', 404);
      }
      if (parent.type !== 'group') {
        throw new AppError('Parent must be a tax group', 400);
      }
    }

    // Get next display order if not provided
    let displayOrder = data.displayOrder;
    if (displayOrder === undefined) {
      const count = await this.taxRepo.countByRestaurant(restaurantId);
      displayOrder = count;
    }

    const taxData: Partial<ITax> = {
      restaurantId: new Types.ObjectId(restaurantId),
      name: data.name,
      description: data.description,
      type: data.type || 'tax',
      taxType: data.taxType,
      value: data.value,
      applicableOn: data.applicableOn,
      category: data.category,
      parentId: data.parentId ? new Types.ObjectId(data.parentId) : undefined,
      conditions: data.conditions
        ? {
            ...data.conditions,
            specificItems: data.conditions.specificItems?.map(
              (id: string) => new Types.ObjectId(id)
            ),
            specificCategories: data.conditions.specificCategories?.map(
              (id: string) => new Types.ObjectId(id)
            ),
          }
        : undefined,
      isPartOfGroup: data.isPartOfGroup || false,
      groupName: data.groupName,
      isActive: true,
      displayOrder,
    };

    const tax = await this.taxRepo.create(taxData);
    return tax;
  }

  async getTax(id: string): Promise<ITax> {
    const tax = await this.taxRepo.findById(id);
    if (!tax || !tax.isActive) {
      throw new AppError('Tax not found', 404);
    }
    return tax;
  }

  async getTaxesByRestaurant(
    restaurantId: string,
    category?: string,
    page: number = 1,
    limit: number = 100
  ) {
    return this.taxRepo.findByRestaurant(restaurantId, category, page, limit);
  }

  async getApplicableTaxes(
    restaurantId: string,
    orderType?: 'dine-in' | 'takeaway',
    orderAmount?: number
  ) {
    // Get applicable taxes
    const taxes = await this.taxRepo.findApplicableTaxes(restaurantId);

    // Filter based on conditions
    const applicableTaxes = taxes.filter((tax) => {
      if (!tax.conditions) return true;

      // Check order type
      if (
        tax.conditions.orderType &&
        tax.conditions.orderType.length > 0 &&
        orderType &&
        !tax.conditions.orderType.includes(orderType)
      ) {
        return false;
      }

      // Check min order amount
      if (
        tax.conditions.minOrderAmount !== undefined &&
        orderAmount !== undefined &&
        orderAmount < tax.conditions.minOrderAmount
      ) {
        return false;
      }

      // Check max order amount
      if (
        tax.conditions.maxOrderAmount !== undefined &&
        orderAmount !== undefined &&
        orderAmount > tax.conditions.maxOrderAmount
      ) {
        return false;
      }

      return true;
    });

    return applicableTaxes;
  }

  async updateTax(id: string, restaurantId: string, data: UpdateTaxDTO): Promise<ITax> {
    const tax = await this.taxRepo.findById(id);
    if (!tax || !tax.isActive) {
      throw new AppError('Tax not found', 404);
    }

    if (ParamsUtil.extractId(tax.restaurantId) !== restaurantId) {
      throw new AppError('Tax does not belong to this restaurant', 403);
    }

    const updateData: Record<string, any> = { ...data };
    if (data.parentId) {
      updateData.parentId = new Types.ObjectId(data.parentId);
    } else if (data.parentId === null) {
      updateData.parentId = null;
    }

    if (data.conditions) {
      updateData.conditions = { ...data.conditions };
      if (data.conditions.specificItems) {
        updateData.conditions.specificItems = data.conditions.specificItems.map(
          (id: string) => new Types.ObjectId(id)
        );
      }
      if (data.conditions.specificCategories) {
        updateData.conditions.specificCategories = data.conditions.specificCategories.map(
          (id: string) => new Types.ObjectId(id)
        );
      }
    }

    const updatedTax = await this.taxRepo.update(id, updateData);
    if (!updatedTax) {
      throw new AppError('Failed to update tax', 500);
    }

    return updatedTax;
  }

  async reorderTaxes(restaurantId: string, taxIds: string[]): Promise<void> {
    const orderMap = taxIds.map((id, index) => ({
      id,
      displayOrder: index,
    }));

    await this.taxRepo.bulkUpdateOrder(orderMap);
  }

  async updateTaxStatus(id: string, restaurantId: string, isActive: boolean): Promise<ITax> {
    const tax = await this.taxRepo.findById(id);
    if (!tax) {
      throw new AppError('Tax not found', 404);
    }

    if (ParamsUtil.extractId(tax.restaurantId) !== restaurantId) {
      throw new AppError('Tax does not belong to this restaurant', 403);
    }

    const updatedTax = await this.taxRepo.updateStatus(id, isActive);
    if (!updatedTax) {
      throw new AppError('Failed to update tax status', 500);
    }

    return updatedTax;
  }

  async deleteTax(id: string, restaurantId: string): Promise<ITax> {
    const tax = await this.taxRepo.findById(id);
    if (!tax) {
      throw new AppError('Tax not found', 404);
    }

    if (ParamsUtil.extractId(tax.restaurantId) !== restaurantId) {
      throw new AppError('Tax does not belong to this restaurant', 403);
    }

    const deletedTax = await this.taxRepo.softDelete(id);
    if (!deletedTax) {
      throw new AppError('Failed to delete tax', 500);
    }

    return deletedTax;
  }
}
