import { Request, Response } from 'express';
import { FeedbackService } from '../services/feedback.service';
import { catchAsync, sendResponse } from '@/utils';

export class FeedbackController {
  private feedbackService: FeedbackService;

  constructor() {
    this.feedbackService = new FeedbackService();
  }

  createFeedback = catchAsync(async (req: Request, res: Response) => {
    const { restaurantId } = req.params;
    const feedback = await this.feedbackService.createFeedback({
      ...req.body,
      restaurantId,
    });
    sendResponse(res, 201, {
      message: 'Feedback submitted successfully',
      data: feedback,
    });
  });

  getAnalytics = catchAsync(async (req: Request, res: Response) => {
    const { restaurantId } = req.params;
    const analytics = await this.feedbackService.getFeedbackAnalytics(restaurantId);
    sendResponse(res, 200, {
      message: 'Analytics retrieved successfully',
      data: analytics,
    });
  });

  getAllFeedback = catchAsync(async (req: Request, res: Response) => {
    const { restaurantId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const filter = {
        type: req.query.type,
        period: req.query.period
    };

    const result = await this.feedbackService.getAllFeedback(restaurantId, filter, page, limit);
    sendResponse(res, 200, {
      message: 'Feedback retrieved successfully',
      data: result,
    });
  });

  incrementRedirect = catchAsync(async (req: Request, res: Response) => {
    const { restaurantId } = req.params;
    await this.feedbackService.incrementGoogleRedirect(restaurantId);
    sendResponse(res, 200, {
      message: 'Redirect tracked successfully',
    });
  });

  updateGoogleSettings = catchAsync(async (req: Request, res: Response) => {
    const { restaurantId } = req.params;
    const restaurant = await this.feedbackService.updateGoogleSettings(restaurantId, req.body);
    sendResponse(res, 200, {
      message: 'Google settings updated successfully',
      data: restaurant,
    });
  });
}
