// src/controllers/category.controller.ts
import { Request, Response } from 'express';
import { CategoryService } from '@/services/category.service';
import { catchAsync, sendResponse } from '@/utils';

export class CategoryController {
  private categoryService: CategoryService;

  constructor() {
    this.categoryService = new CategoryService();
  }

  createCategory = catchAsync(async (req: Request, res: Response) => {
    const restaurantId = req.params.restaurantId || req.user?.restaurantId;

    if (!restaurantId) {
      sendResponse(res, 400, {
        message: 'Restaurant ID is required',
      });
      return;
    }

    const category = await this.categoryService.createCategory(restaurantId, req.body);
    
    sendResponse(res, 201, {
      message: 'Category created successfully',
      data: category,
    });
  });

  getCategory = catchAsync(async (req: Request, res: Response) => {
    const category = await this.categoryService.getCategory(req.params.id);
    
    sendResponse(res, 200, {
      message: 'Category retrieved successfully',
      data: category,
    });
  });

  getCategoriesByRestaurant = catchAsync(async (req: Request, res: Response) => {
    const restaurantId = req.params.restaurantId || req.user?.restaurantId;
    const scope = (req.query.scope as 'restaurant' | 'branch') || 'restaurant';
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;

    const result = await this.categoryService.getCategoriesByRestaurant(
      restaurantId!,
      scope,
      page,
      limit
    );
    
    sendResponse(res, 200, {
      message: 'Categories retrieved successfully',
      data: result,
    });
  });

  getCategoriesByBranch = catchAsync(async (req: Request, res: Response) => {
    const { branchId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;

    const result = await this.categoryService.getCategoriesByBranch(branchId, page, limit);
    
    sendResponse(res, 200, {
      message: 'Categories retrieved successfully',
      data: result,
    });
  });

  getAllCategoriesForMenu = catchAsync(async (req: Request, res: Response) => {
    const restaurantId = req.params.restaurantId || req.user?.restaurantId;
    const branchId = req.query.branchId as string | undefined;

    const categories = await this.categoryService.getAllCategoriesForMenu(
      restaurantId!,
      branchId
    );
    
    sendResponse(res, 200, {
      message: 'Categories retrieved successfully',
      data: categories,
    });
  });

  updateCategory = catchAsync(async (req: Request, res: Response) => {
    const restaurantId = req.params.restaurantId || req.user?.restaurantId;
    const category = await this.categoryService.updateCategory(
      req.params.id,
      restaurantId!,
      req.body
    );
    
    sendResponse(res, 200, {
      message: 'Category updated successfully',
      data: category,
    });
  });

  updateDisplayOrder = catchAsync(async (req: Request, res: Response) => {
    const restaurantId = req.params.restaurantId || req.user?.restaurantId;
    const { displayOrder } = req.body;

    if (displayOrder === undefined) {
      sendResponse(res, 400, {
        message: 'Display order is required',
      });
      return;
    }

    const category = await this.categoryService.updateDisplayOrder(
      req.params.id,
      restaurantId!,
      displayOrder
    );
    
    sendResponse(res, 200, {
      message: 'Display order updated successfully',
      data: category,
    });
  });

  deleteCategory = catchAsync(async (req: Request, res: Response) => {
    const restaurantId = req.params.restaurantId || req.user?.restaurantId;
    const category = await this.categoryService.deleteCategory(
      req.params.id,
      restaurantId!
    );
    
    sendResponse(res, 200, {
      message: 'Category deleted successfully',
      data: category,
    });
  });
}