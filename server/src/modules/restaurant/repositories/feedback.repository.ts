import { Feedback, IFeedback } from '../models/feedback.model';
import { Types } from 'mongoose';

export class FeedbackRepository {
  async create(data: Partial<IFeedback>): Promise<IFeedback> {
    return Feedback.create(data);
  }

  async findAll(filter: any = {}, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;
    const [feedbacks, total] = await Promise.all([
      Feedback.find(filter)
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }),
      Feedback.countDocuments(filter),
    ]);

    return {
      feedbacks,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getAnalytics(restaurantId: string) {
    const rId = new Types.ObjectId(restaurantId);

    const stats = await Feedback.aggregate([
      { $match: { restaurantId: rId } },
      {
        $group: {
          _id: null,
          totalFeedbacks: { $sum: 1 },
          avgFood: { $avg: '$food' },
          avgService: { $avg: '$service' },
          avgCleanliness: { $avg: '$cleanliness' },
          avgAtmosphere: { $avg: '$atmosphere' },
          avgValueForMoney: { $avg: '$valueForMoney' },
        },
      },
    ]);

    if (stats.length === 0) {
      return {
        totalFeedbacks: 0,
        avgFood: 0,
        avgService: 0,
        avgCleanliness: 0,
        avgAtmosphere: 0,
        avgValueForMoney: 0,
        overallRating: 0,
      };
    }

    const s = stats[0];
    const overallRating = (s.avgFood + s.avgService + s.avgCleanliness + s.avgAtmosphere + s.avgValueForMoney) / 5;

    return {
      totalFeedbacks: s.totalFeedbacks,
      avgFood: s.avgFood,
      avgService: s.avgService,
      avgCleanliness: s.avgCleanliness,
      avgAtmosphere: s.avgAtmosphere,
      avgValueForMoney: s.avgValueForMoney,
      overallRating,
    };
  }

  async getNegativeCount(restaurantId: string) {
    const rId = new Types.ObjectId(restaurantId);
    // Negative feedback: average of ratings < 3
    return Feedback.aggregate([
        { $match: { restaurantId: rId } },
        {
          $project: {
            avg: { $divide: [{ $add: ['$food', '$service', '$cleanliness', '$atmosphere', '$valueForMoney'] }, 5] }
          }
        },
        { $match: { avg: { $lt: 3 } } },
        { $count: 'count' }
      ]);
  }
}
