import { Request, Response } from 'express';
import { RestaurantRepository } from '../repositories/restaurant.repository';
import { catchAsync, sendResponse, ParamsUtil } from '@/utils';

export class RestaurantController {
  private restaurantRepo: RestaurantRepository;

  constructor() {
    this.restaurantRepo = new RestaurantRepository();
  }

  getRestaurant = catchAsync(async (req: Request, res: Response) => {
    const id = ParamsUtil.getString(req.params.id);
    const restaurant = await this.restaurantRepo.findById(id);
    sendResponse(res, 200, { message: 'Restaurant retrieved', data: restaurant });
  });

  updateRestaurant = catchAsync(async (req: Request, res: Response) => {
    const id = ParamsUtil.getString(req.params.id);
    const restaurant = await this.restaurantRepo.update(id, req.body);
    sendResponse(res, 200, { message: 'Restaurant updated', data: restaurant });
  });
}
