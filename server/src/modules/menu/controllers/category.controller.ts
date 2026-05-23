import { Request, Response } from 'express';
import { CategoryRepository } from '../repositories/category.repository';
import { catchAsync, sendResponse, ParamsUtil } from '@/utils';

export class CategoryController {
  private categoryRepo: CategoryRepository;

  constructor() {
    this.categoryRepo = new CategoryRepository();
  }

  createCategory = catchAsync(async (req: Request, res: Response) => {
    const restaurantId = ParamsUtil.getString(req.params.restaurantId);
    const category = await this.categoryRepo.create({ ...req.body, restaurantId });
    sendResponse(res, 201, { message: 'Category created', data: category });
  });

  getCategories = catchAsync(async (req: Request, res: Response) => {
    const restaurantId = ParamsUtil.getString(req.params.restaurantId);
    const categories = await this.categoryRepo.findAll(restaurantId);
    sendResponse(res, 200, { message: 'Categories retrieved', data: categories });
  });

  getCategory = catchAsync(async (req: Request, res: Response) => {
    const id = ParamsUtil.getString(req.params.id);
    const category = await this.categoryRepo.findById(id);
    sendResponse(res, 200, { message: 'Category retrieved', data: category });
  });

  updateCategory = catchAsync(async (req: Request, res: Response) => {
    const id = ParamsUtil.getString(req.params.id);
    const category = await this.categoryRepo.update(id, req.body);
    sendResponse(res, 200, { message: 'Category updated', data: category });
  });

  deleteCategory = catchAsync(async (req: Request, res: Response) => {
    const id = ParamsUtil.getString(req.params.id);
    await this.categoryRepo.delete(id);
    sendResponse(res, 204, { message: 'Category deleted' });
  });
}
