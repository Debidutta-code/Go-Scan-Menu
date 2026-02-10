// src/services/category.service.ts
import { CategoryRepository } from '@/repositories/category.repository';
import { RestaurantRepository } from '@/repositories/restaurant.repository';
import { BranchRepository } from '@/repositories/branch.repository';
import { ICategory } from '@/models/Category.model';
import { AppError } from '@/utils/AppError';
import { Types } from 'mongoose';

export class CategoryService {
  private categoryRepo: CategoryRepository;
  private restaurantRepo: RestaurantRepository;
  private branchRepo: BranchRepository;

  constructor() {
    this.categoryRepo = new CategoryRepository();
    this.restaurantRepo = new RestaurantRepository();
    this.branchRepo = new BranchRepository();
  }

  /**
   * Helper to extract restaurantId as string from either ObjectId or populated document
   */
  private extractRestaurantId(restaurantId: any): string {
    if (!restaurantId) {
      throw new AppError('Restaurant ID is missing', 500);
    }

    // If it's a populated document with _id
    if (typeof restaurantId === 'object' && restaurantId._id) {
      return restaurantId._id.toString();
    }

    // If it's an ObjectId or string
    if (typeof restaurantId.toString === 'function') {
      return restaurantId.toString();
    }

    throw new AppError('Invalid restaurant ID format', 500);
  }

  async createCategory(
    restaurantId: string,
    data: {
      name: string;
      description?: string;
      image?: string;
      displayOrder?: number;
      scope: 'restaurant' | 'branch';
      branchId?: string;
    }
  ) {
    // Verify restaurant exists
    const restaurant = await this.restaurantRepo.findById(restaurantId);
    if (!restaurant || !restaurant.isActive) {
      throw new AppError('Restaurant not found or inactive', 404);
    }

    // If scope is branch, verify branch exists and belongs to restaurant
    if (data.scope === 'branch') {
      if (!data.branchId) {
        throw new AppError('Branch ID is required for branch-specific categories', 400);
      }

      const branch = await this.branchRepo.findByIdAndRestaurant(data.branchId, restaurantId);
      if (!branch || !branch.isActive) {
        throw new AppError('Branch not found or inactive', 404);
      }
    }

    // Auto-increment display order if not provided
    let displayOrder = data.displayOrder;
    if (displayOrder === undefined || displayOrder === null) {
      const count = await this.categoryRepo.countByRestaurant(restaurantId, data.scope);
      displayOrder = count;
    }

    const categoryData: Partial<ICategory> = {
      restaurantId: new Types.ObjectId(restaurantId),
      branchId: data.branchId ? new Types.ObjectId(data.branchId) : undefined,
      name: data.name,
      description: data.description,
      image: data.image,
      displayOrder,
      scope: data.scope,
      isActive: true,
    };

    const category = await this.categoryRepo.create(categoryData);
    return category;
  }

  async getCategory(id: string): Promise<ICategory> {
    const category = await this.categoryRepo.findById(id);
    if (!category || !category.isActive) {
      throw new AppError('Category not found', 404);
    }
    return category;
  }

  async getCategoriesByRestaurant(
    restaurantId: string,
    scope: 'restaurant' | 'branch' = 'restaurant',
    page: number = 1,
    limit: number = 50
  ) {
    return this.categoryRepo.findByRestaurant(restaurantId, scope, page, limit);
  }

  async getCategoriesByBranch(branchId: string, page: number = 1, limit: number = 50) {
    return this.categoryRepo.findByBranch(branchId, page, limit);
  }

  async getAllCategoriesForMenu(restaurantId: string, branchId?: string) {
    return this.categoryRepo.findAllForMenu(restaurantId, branchId);
  }

  async getCategoryCount(restaurantId: string, scope?: 'restaurant' | 'branch'): Promise<number> {
    return this.categoryRepo.countByRestaurant(restaurantId, scope);
  }

  async updateCategory(
    id: string,
    restaurantId: string,
    data: Partial<ICategory>
  ): Promise<ICategory> {
    const category = await this.categoryRepo.findById(id, false);
    
    if (!category || !category.isActive) {
      throw new AppError('Category not found', 404);
    }

    // Use helper to extract restaurantId
    const categoryRestaurantId = this.extractRestaurantId(category.restaurantId);
    const requestRestaurantId = restaurantId.toString();

    if (categoryRestaurantId !== requestRestaurantId) {
      throw new AppError('Category does not belong to this restaurant', 403);
    }

    // Don't allow changing scope after creation
    if (data.scope && data.scope !== category.scope) {
      throw new AppError('Cannot change category scope after creation', 400);
    }

    // Don't allow changing critical fields
    const updateData = { ...data };
    delete (updateData as any).restaurantId;
    delete (updateData as any).branchId;
    delete (updateData as any).scope;
    delete (updateData as any).displayOrder;

    const updatedCategory = await this.categoryRepo.update(id, updateData);
    if (!updatedCategory) {
      throw new AppError('Failed to update category', 500);
    }

    return updatedCategory;
  }

  async updateDisplayOrder(
    id: string,
    restaurantId: string,
    displayOrder: number
  ): Promise<ICategory> {
    const category = await this.categoryRepo.findById(id, false);
    
    if (!category || !category.isActive) {
      throw new AppError('Category not found', 404);
    }

    // Use helper to extract restaurantId
    const categoryRestaurantId = this.extractRestaurantId(category.restaurantId);
    const requestRestaurantId = restaurantId.toString();

    if (categoryRestaurantId !== requestRestaurantId) {
      throw new AppError('Category does not belong to this restaurant', 403);
    }

    const updatedCategory = await this.categoryRepo.updateDisplayOrder(id, displayOrder);
    if (!updatedCategory) {
      throw new AppError('Failed to update display order', 500);
    }

    return updatedCategory;
  }
}
