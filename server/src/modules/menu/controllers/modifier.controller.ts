import { Request, Response } from 'express';
import { ModifierService } from '../services/modifier.service';
import { catchAsync, sendResponse, ParamsUtil } from '@/utils';

export class ModifierController {
  private modifierService: ModifierService;

  constructor() {
    this.modifierService = new ModifierService();
  }

  // Options
  createOption = catchAsync(async (req: Request, res: Response) => {
    const restaurantId = ParamsUtil.extractId(req.params.restaurantId);
    const option = await this.modifierService.createOption(restaurantId, req.body);
    sendResponse(res, 201, { message: 'Option created successfully', data: option });
  });

  getOptions = catchAsync(async (req: Request, res: Response) => {
    const restaurantId = ParamsUtil.extractId(req.params.restaurantId);
    const options = await this.modifierService.getOptionsByRestaurant(restaurantId);
    sendResponse(res, 200, { message: 'Options retrieved successfully', data: options });
  });

  updateOption = catchAsync(async (req: Request, res: Response) => {
    const restaurantId = ParamsUtil.extractId(req.params.restaurantId);
    const id = req.params.id;
    const option = await this.modifierService.updateOption(id, restaurantId, req.body);
    sendResponse(res, 200, { message: 'Option updated successfully', data: option });
  });

  deleteOption = catchAsync(async (req: Request, res: Response) => {
    const restaurantId = ParamsUtil.extractId(req.params.restaurantId);
    const id = req.params.id;
    await this.modifierService.deleteOption(id, restaurantId);
    sendResponse(res, 200, { message: 'Option deleted successfully' });
  });

  // Groups
  createGroup = catchAsync(async (req: Request, res: Response) => {
    const restaurantId = ParamsUtil.extractId(req.params.restaurantId);
    const group = await this.modifierService.createGroup(restaurantId, req.body);
    sendResponse(res, 201, { message: 'Modifier group created successfully', data: group });
  });

  getGroups = catchAsync(async (req: Request, res: Response) => {
    const restaurantId = ParamsUtil.extractId(req.params.restaurantId);
    const groups = await this.modifierService.getGroupsByRestaurant(restaurantId);
    sendResponse(res, 200, { message: 'Modifier groups retrieved successfully', data: groups });
  });

  getGroup = catchAsync(async (req: Request, res: Response) => {
    const restaurantId = ParamsUtil.extractId(req.params.restaurantId);
    const id = req.params.id;
    const group = await this.modifierService.getGroupById(id, restaurantId);
    sendResponse(res, 200, { message: 'Modifier group retrieved successfully', data: group });
  });

  updateGroup = catchAsync(async (req: Request, res: Response) => {
    const restaurantId = ParamsUtil.extractId(req.params.restaurantId);
    const id = req.params.id;
    const group = await this.modifierService.updateGroup(id, restaurantId, req.body);
    sendResponse(res, 200, { message: 'Modifier group updated successfully', data: group });
  });

  deleteGroup = catchAsync(async (req: Request, res: Response) => {
    const restaurantId = ParamsUtil.extractId(req.params.restaurantId);
    const id = req.params.id;
    await this.modifierService.deleteGroup(id, restaurantId);
    sendResponse(res, 200, { message: 'Modifier group deleted successfully' });
  });
}
