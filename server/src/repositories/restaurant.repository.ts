// src/repositories/restaurant.repository.ts
import { Restaurant, IRestaurant } from '@/models/Restaurant.model';
import { Types } from 'mongoose';

export class RestaurantRepository {
  async create(data: Partial<IRestaurant>): Promise<IRestaurant> {
    const restaurant = await Restaurant.create(data);
    return restaurant;
  }

  async findById(id: string): Promise<IRestaurant | null> {
    return Restaurant.findById(id)
    // .populate('defaultSettings.defaultTaxIds');
  }

  async findBySlug(slug: string): Promise<IRestaurant | null> {
    return Restaurant.findOne({ slug }).populate('defaultSettings.defaultTaxIds');
  }

  async findByOwnerId(ownerId: string): Promise<IRestaurant | null> {
    return Restaurant.findOne({ ownerId }).populate('defaultSettings.defaultTaxIds');
  }

  async findByOwnerEmail(email: string): Promise<IRestaurant | null> {
    return Restaurant.findOne({ 'owner.email': email });
  }

  async findAll(filter: any = {}, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;
    const [restaurants, total] = await Promise.all([
      Restaurant.find(filter)
        .populate('defaultSettings.defaultTaxIds')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }),
      Restaurant.countDocuments(filter),
    ]);

    return {
      restaurants,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async update(id: string, data: Partial<IRestaurant>): Promise<IRestaurant | null> {
    return Restaurant.findByIdAndUpdate(id, data, { new: true }).populate(
      'defaultSettings.defaultTaxIds'
    );
  }

  async updateTheme(id: string, theme: Partial<IRestaurant['theme']>): Promise<IRestaurant | null> {
    return Restaurant.findByIdAndUpdate(id, { $set: { theme } }, { new: true });
  }

  async updateSubscription(
    id: string,
    subscription: Partial<IRestaurant['subscription']>
  ): Promise<IRestaurant | null> {
    return Restaurant.findByIdAndUpdate(id, { $set: { subscription } }, { new: true });
  }

  async updateDefaultSettings(
    id: string,
    settings: Partial<IRestaurant['defaultSettings']>
  ): Promise<IRestaurant | null> {
    return Restaurant.findByIdAndUpdate(id, { $set: { defaultSettings: settings } }, { new: true });
  }

  async delete(id: string): Promise<IRestaurant | null> {
    return Restaurant.findByIdAndUpdate(id, { isActive: false }, { new: true });
  }

  async incrementBranchCount(id: string): Promise<void> {
    await Restaurant.findByIdAndUpdate(id, { $inc: { 'subscription.currentBranches': 1 } });
  }

  async decrementBranchCount(id: string): Promise<void> {
    await Restaurant.findByIdAndUpdate(id, { $inc: { 'subscription.currentBranches': -1 } });
  }
}
