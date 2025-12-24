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

    // Get next display order if not provided
    let displayOrder = data.displayOrder;
    if (displayOrder === undefined) {
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

  async getCategoriesByBranch(
    branchId: string,
    page: number = 1,
    limit: number = 50
  ) {
    return this.categoryRepo.findByBranch(branchId, page, limit);
  }

  async getAllCategoriesForMenu(restaurantId: string, branchId?: string) {
    // Returns both restaurant-wide and branch-specific categories
    return this.categoryRepo.findAllForMenu(restaurantId, branchId);
  }

  async updateCategory(
    id: string,
    restaurantId: string,
    data: Partial<ICategory>
  ): Promise<ICategory> {
    const category = await this.categoryRepo.findById(id);
    if (!category || !category.isActive) {
      throw new AppError('Category not found', 404);
    }

    if (category.restaurantId.toString() !== restaurantId) {
      throw new AppError('Category does not belong to this restaurant', 403);
    }

    const updatedCategory = await this.categoryRepo.update(id, data);
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
    const category = await this.categoryRepo.findById(id);
    if (!category || !category.isActive) {
      throw new AppError('Category not found', 404);
    }

    if (category.restaurantId.toString() !== restaurantId) {
      throw new AppError('Category does not belong to this restaurant', 403);
    }

    const updatedCategory = await this.categoryRepo.updateDisplayOrder(id, displayOrder);
    if (!updatedCategory) {
      throw new AppError('Failed to update display order', 500);
    }

    return updatedCategory;
  }

  async deleteCategory(id: string, restaurantId: string): Promise<ICategory> {
    const category = await this.categoryRepo.findById(id);
    if (!category) {
      throw new AppError('Category not found', 404);
    }

    if (category.restaurantId.toString() !== restaurantId) {
      throw new AppError('Category does not belong to this restaurant', 403);
    }

    // TODO: Check if category has menu items before deleting
    // For now, we'll just soft delete

    const deletedCategory = await this.categoryRepo.softDelete(id);
    if (!deletedCategory) {
      throw new AppError('Failed to delete category', 500);
    }

    return deletedCategory;
  }
}