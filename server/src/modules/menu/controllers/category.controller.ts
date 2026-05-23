// src/controllers/category.controller.ts
import { Request, Response } from 'express';
import { CategoryService } from '../services/category.service';
import { catchAsync, ParamsUtil, sendResponse } from '@/utils';

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
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;

    const result = await this.categoryService.getCategoriesByRestaurant(
      restaurantId!,
      page,
      limit
    );

    sendResponse(res, 200, {
      message: 'Categories retrieved successfully',
      data: result,
    });
  });

  getAllCategoriesForMenu = catchAsync(async (req: Request, res: Response) => {
    const restaurantId = req.params.restaurantId || req.user?.restaurantId;

    const categories = await this.categoryService.getAllCategoriesForMenu(restaurantId!);

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

  // PUBLIC ENDPOINTS (No authentication required)

  getPublicCategories = catchAsync(async (req: Request, res: Response) => {
    const restaurantId = req.params.restaurantId;

    if (!restaurantId) {
      sendResponse(res, 400, {
        message: 'Restaurant ID is required',
      });
      return;
    }

    const categories = await this.categoryService.getAllCategoriesForMenu(restaurantId);

    sendResponse(res, 200, {
      message: 'Categories retrieved successfully',
      data: { categories },
    });
  });

  getPublicCategoryCount = catchAsync(async (req: Request, res: Response) => {
    const restaurantId = req.params.restaurantId;

    if (!restaurantId) {
      sendResponse(res, 400, {
        message: 'Restaurant ID is required',
      });
      return;
    }

    const count = await this.categoryService.getCategoryCount(restaurantId);

    sendResponse(res, 200, {
      message: 'Category count retrieved successfully',
      data: { count },
    });
  });
}
