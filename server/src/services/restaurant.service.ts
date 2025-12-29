// src/services/restaurant.service.ts
import { RestaurantRepository } from '@/repositories/restaurant.repository';
import { StaffRepository } from '@/repositories/staff.repository';
import { IRestaurant } from '@/models/Restaurant.model';
import { BcryptUtil } from '@/utils';
import { AppError } from '@/utils/AppError';
import { defaultSettings, defaultTheme } from '@/constants';
import { TaxRepository } from '@/repositories/tax.repository';

export class RestaurantService {
  private restaurantRepo: RestaurantRepository;
  private staffRepo: StaffRepository;
  private taxRepo: TaxRepository;

  constructor() {
    this.restaurantRepo = new RestaurantRepository();
    this.staffRepo = new StaffRepository();
    this.taxRepo = new TaxRepository(); // ADD THIS
  }

  async createRestaurant(data: {
    name: string;
    slug: string;
    type: 'single' | 'chain';
    owner: {
      name: string;
      email: string;
      phone: string;
      password: string;
    };
    subscription?: Partial<IRestaurant['subscription']>;
    theme?: Partial<IRestaurant['theme']>;
    defaultSettings?: Partial<IRestaurant['defaultSettings']>;
  }) {
    // Check if slug or email already exists
    const existingRestaurant = await this.restaurantRepo.findBySlug(data.slug);
    if (existingRestaurant) {
      throw new AppError('Restaurant with this slug already exists', 400);
    }

    const existingEmail = await this.restaurantRepo.findByOwnerEmail(data.owner.email);
    if (existingEmail) {
      throw new AppError('Owner email already registered', 400);
    }

    // Hash owner password
    const hashedPassword = await BcryptUtil.hash(data.owner.password);

    // Set default subscription dates
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 30); // 30-day trial

    const restaurantData: Partial<IRestaurant> = {
      name: data.name,
      slug: data.slug,
      type: data.type,
      owner: {
        ...data.owner,
        password: hashedPassword,
      },
      subscription: {
        plan: 'trial',
        startDate,
        endDate,
        isActive: true,
        maxBranches: data.type === 'single' ? 1 : 5,
        currentBranches: 0,
        ...data.subscription,
      },
      theme: { ...defaultTheme, ...data.theme }, // ← Merge
      defaultSettings: { ...defaultSettings, ...data.defaultSettings }, // ← Merge
      isActive: true,
    };

    const restaurant = await this.restaurantRepo.create(restaurantData);

    // Create owner staff record
    const ownerStaff = await this.staffRepo.create({
      restaurantId: restaurant._id,
      name: data.owner.name,
      email: data.owner.email,
      phone: data.owner.phone,
      password: hashedPassword,
      role: 'owner',
      accessLevel: 'all_branches',
      allowedBranchIds: [],
      permissions: {
        canViewOrders: true,
        canUpdateOrders: true,
        canManageMenu: true,
        canManageStaff: true,
        canViewReports: true,
        canManageSettings: true,
      },
      isActive: true,
    });

    // Link owner staff to restaurant
    await this.restaurantRepo.update(restaurant._id.toString(), {
      ownerId: ownerStaff._id,
    });

    return { restaurant, ownerStaff };
  }

  async getRestaurant(id: string) {
    const restaurant = await this.restaurantRepo.findById(id);
    if (!restaurant) {
      throw new AppError('Restaurant not found', 404);
    }
    return restaurant;
  }

  async getRestaurantBySlug(slug: string) {
    const restaurant = await this.restaurantRepo.findBySlug(slug);
    if (!restaurant) {
      throw new AppError('Restaurant not found', 404);
    }
    return restaurant;
  }

  async getAllRestaurants(filter: any, page: number, limit: number) {
    return this.restaurantRepo.findAll(filter, page, limit);
  }

  async updateRestaurant(id: string, data: Partial<IRestaurant>) {
    const restaurant = await this.restaurantRepo.update(id, data);
    if (!restaurant) {
      throw new AppError('Restaurant not found', 404);
    }
    return restaurant;
  }

  async updateTheme(id: string, theme: Partial<IRestaurant['theme']>) {
    const restaurant = await this.restaurantRepo.updateTheme(id, theme);
    if (!restaurant) {
      throw new AppError('Restaurant not found', 404);
    }
    return restaurant;
  }

  async updateSubscription(id: string, subscription: Partial<IRestaurant['subscription']>) {
    const restaurant = await this.restaurantRepo.updateSubscription(id, subscription);
    if (!restaurant) {
      throw new AppError('Restaurant not found', 404);
    }
    return restaurant;
  }

  async updateDefaultSettings(id: string, settings: Partial<IRestaurant['defaultSettings']>) {
    // NEW: Validate defaultTaxIds if being updated
    if (settings.defaultTaxIds && settings.defaultTaxIds.length > 0) {
      const taxes = await this.taxRepo.findByIds(settings.defaultTaxIds.map((id) => id.toString()));

      if (taxes.length !== settings.defaultTaxIds.length) {
        throw new AppError('One or more default tax IDs are invalid or inactive', 400);
      }

      // Verify taxes belong to this restaurant (restaurant-scoped only)
      const invalidTaxes = taxes.filter(
        (tax) => tax.restaurantId.toString() !== id || tax.scope !== 'restaurant'
      );

      if (invalidTaxes.length > 0) {
        throw new AppError(
          'Default taxes must be restaurant-scoped and belong to this restaurant',
          403
        );
      }
    }

    const restaurant = await this.restaurantRepo.updateDefaultSettings(id, settings);
    if (!restaurant) {
      throw new AppError('Restaurant not found', 404);
    }
    return restaurant;
  }

  async deleteRestaurant(id: string) {
    const restaurant = await this.restaurantRepo.delete(id);
    if (!restaurant) {
      throw new AppError('Restaurant not found', 404);
    }
    return restaurant;
  }
}
