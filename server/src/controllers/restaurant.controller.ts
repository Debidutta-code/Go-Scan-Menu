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
    const restaurant = await this.restaurantService.getRestaurant(req.params.id);
    sendResponse(res, 200, {
      message: 'Restaurant retrieved successfully',
      data: restaurant,
    });
  });

  getRestaurantBySlug = catchAsync(async (req: Request, res: Response) => {
    const restaurant = await this.restaurantService.getRestaurantBySlug(req.params.slug);
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
    const restaurant = await this.restaurantService.updateRestaurant(req.params.id, req.body);
    sendResponse(res, 200, {
      message: 'Restaurant updated successfully',
      data: restaurant,
    });
  });

  updateTheme = catchAsync(async (req: Request, res: Response) => {
    const restaurant = await this.restaurantService.updateTheme(req.params.id, req.body);
    sendResponse(res, 200, {
      message: 'Theme updated successfully',
      data: restaurant,
    });
  });

  updateSubscription = catchAsync(async (req: Request, res: Response) => {
    const restaurant = await this.restaurantService.updateSubscription(req.params.id, req.body);
    sendResponse(res, 200, {
      message: 'Subscription updated successfully',
      data: restaurant,
    });
  });

  updateDefaultSettings = catchAsync(async (req: Request, res: Response) => {
    const restaurant = await this.restaurantService.updateDefaultSettings(req.params.id, req.body);
    sendResponse(res, 200, {
      message: 'Default settings updated successfully',
      data: restaurant,
    });
  });

  deleteRestaurant = catchAsync(async (req: Request, res: Response) => {
    const restaurant = await this.restaurantService.deleteRestaurant(req.params.id);
    sendResponse(res, 200, {
      message: 'Restaurant deleted successfully',
      data: restaurant,
    });
  });
}
