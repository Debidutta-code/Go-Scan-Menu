import { FeedbackRepository } from '../repositories/feedback.repository';
import { RestaurantRepository } from '../repositories/restaurant.repository';
import { IFeedback } from '../models/feedback.model';
import { AppError } from '@/utils/AppError';

export class FeedbackService {
  private feedbackRepo: FeedbackRepository;
  private restaurantRepo: RestaurantRepository;

  constructor() {
    this.feedbackRepo = new FeedbackRepository();
    this.restaurantRepo = new RestaurantRepository();
  }

  async createFeedback(data: Partial<IFeedback>) {
    return this.feedbackRepo.create(data);
  }

  async getFeedbackAnalytics(restaurantId: string) {
    const analytics = await this.feedbackRepo.getAnalytics(restaurantId);
    const negativeStats = await this.feedbackRepo.getNegativeCount(restaurantId);
    const restaurant = await this.restaurantRepo.findById(restaurantId);

    return {
      ...analytics,
      negativeFeedbackCount: negativeStats.length > 0 ? negativeStats[0].count : 0,
      googleReviewRedirects: restaurant?.googleReviewRedirects || 0,
    };
  }

  async getAllFeedback(restaurantId: string, filter: any, page: number, limit: number) {
    const query: any = { restaurantId };

    if (filter.type === 'positive') {
        // Average >= 4
        query.$expr = { $gte: [{ $divide: [{ $add: ['$food', '$service', '$cleanliness', '$atmosphere', '$valueForMoney'] }, 5] }, 4] };
    } else if (filter.type === 'negative') {
        // Average < 3
        query.$expr = { $lt: [{ $divide: [{ $add: ['$food', '$service', '$cleanliness', '$atmosphere', '$valueForMoney'] }, 5] }, 3] };
    }

    if (filter.period === 'today') {
        const start = new Date();
        start.setHours(0, 0, 0, 0);
        query.createdAt = { $gte: start };
    } else if (filter.period === 'week') {
        const start = new Date();
        start.setDate(start.getDate() - 7);
        query.createdAt = { $gte: start };
    }

    return this.feedbackRepo.findAll(query, page, limit);
  }

  async incrementGoogleRedirect(restaurantId: string) {
    const restaurant = await this.restaurantRepo.incrementGoogleRedirects(restaurantId);
    if (!restaurant) {
      throw new AppError('Restaurant not found', 404);
    }
    return restaurant;
  }

  async updateGoogleSettings(restaurantId: string, data: { googlePlaceId?: string; googleReviewEnabled?: boolean }) {
    const restaurant = await this.restaurantRepo.updateGoogleSettings(restaurantId, data);
    if (!restaurant) {
      throw new AppError('Restaurant not found', 404);
    }
    return restaurant;
  }
}
