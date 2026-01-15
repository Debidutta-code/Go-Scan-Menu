// src/controllers/restaurant.controller.ts
import { Request, Response } from 'express';
import { RestaurantService } from '@/services/restaurant.service';
import { catchAsync, sendResponse } from '@/utils';

export class RestaurantController {
  private restaurantService: RestaurantService;

  constructor() {
    this.restaurantService = new RestaurantService();
  }

  createRestaurant = catchAsync(async (req: Request, res: Response) => {
    const result = await this.restaurantService.createRestaurant(req.body);
    sendResponse(res, 201, {
      message: 'Restaurant created successfully',
      data: result,
    });
  });

  getRestaurant = catchAsync(async (req: Request, res: Response) => {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const restaurant = await this.restaurantService.getRestaurant(id);
    sendResponse(res, 200, {
      message: 'Restaurant retrieved successfully',
      data: restaurant,
    });
  });

  getRestaurantBySlug = catchAsync(async (req: Request, res: Response) => {
    const slug = Array.isArray(req.params.slug) ? req.params.slug[0] : req.params.slug;
    const restaurant = await this.restaurantService.getRestaurantBySlug(slug);
    sendResponse(res, 200, {
      message: 'Restaurant retrieved successfully',
      data: restaurant,
    });
  });

  getAllRestaurants = catchAsync(async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const filter = req.query.filter ? JSON.parse(req.query.filter as string) : {};

    const result = await this.restaurantService.getAllRestaurants(filter, page, limit);
    sendResponse(res, 200, {
      message: 'Restaurants retrieved successfully',
      data: result,
    });
  });

  updateRestaurant = catchAsync(async (req: Request, res: Response) => {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const restaurant = await this.restaurantService.updateRestaurant(id, req.body);
    sendResponse(res, 200, {
      message: 'Restaurant updated successfully',
      data: restaurant,
    });
  });

  updateTheme = catchAsync(async (req: Request, res: Response) => {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const restaurant = await this.restaurantService.updateTheme(id, req.body);
    sendResponse(res, 200, {
      message: 'Theme updated successfully',
      data: restaurant,
    });
  });

  updateSubscription = catchAsync(async (req: Request, res: Response) => {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const restaurant = await this.restaurantService.updateSubscription(id, req.body);
    sendResponse(res, 200, {
      message: 'Subscription updated successfully',
      data: restaurant,
    });
  });

  updateDefaultSettings = catchAsync(async (req: Request, res: Response) => {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const restaurant = await this.restaurantService.updateDefaultSettings(id, req.body);
    sendResponse(res, 200, {
      message: 'Default settings updated successfully',
      data: restaurant,
    });
  });

  deleteRestaurant = catchAsync(async (req: Request, res: Response) => {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const restaurant = await this.restaurantService.deleteRestaurant(id);
    sendResponse(res, 200, {
      message: 'Restaurant deleted successfully',
      data: restaurant,
    });
  });
}
