import { Request, Response } from 'express';
import { StaffService } from '../services/staff.service';
import { catchAsync, sendResponse, ParamsUtil } from '@/utils';

export class StaffController {
  private staffService: StaffService;

  constructor() {
    this.staffService = new StaffService();
  }

  createStaff = catchAsync(async (req: Request, res: Response) => {
    const staff = await this.staffService.createStaff(req.body);
    sendResponse(res, 201, { message: 'Staff created', data: staff });
  });

  getStaff = catchAsync(async (req: Request, res: Response) => {
    const id = ParamsUtil.getString(req.params.id);
    const staff = await this.staffService.getStaffById(id);
    sendResponse(res, 200, { message: 'Staff retrieved', data: staff });
  });

  updateStaff = catchAsync(async (req: Request, res: Response) => {
    const id = ParamsUtil.getString(req.params.id);
    const staff = await this.staffService.updateStaff(id, req.body);
    sendResponse(res, 200, { message: 'Staff updated', data: staff });
  });

  deleteStaff = catchAsync(async (req: Request, res: Response) => {
    const id = ParamsUtil.getString(req.params.id);
    await this.staffService.deleteStaff(id);
    sendResponse(res, 204, { message: 'Staff deleted' });
  });
}
