import { RestaurantRepository } from '../../restaurant/repositories/restaurant.repository';
import { CategoryRepository } from '../repositories/category.repository';
import { MenuItemRepository } from '../repositories/menu-item.repository';
import { AppError } from '@/utils/AppError';

export class PublicMenuService {
  private restaurantRepo: RestaurantRepository;
  private categoryRepo: CategoryRepository;
  private menuItemRepo: MenuItemRepository;

  constructor() {
    this.restaurantRepo = new RestaurantRepository();
    this.categoryRepo = new CategoryRepository();
    this.menuItemRepo = new MenuItemRepository();
  }

  // ─── GET /public/categories/:restaurantSlug ───────────────────────────────
  // Lightweight — returns only category summaries with item counts.
  // Used by the landing/grid page.
  async getCategoriesBySlug(restaurantSlug: string) {
    const restaurant = await this.restaurantRepo.findBySlug(restaurantSlug);
    if (!restaurant || !restaurant.isActive) {
      throw new AppError('Restaurant not found', 404);
    }

    const restaurantId = restaurant._id.toString();
    const categories = await this.categoryRepo.findAllForMenu(restaurantId);
    const items = await this.menuItemRepo.findAllForMenu(restaurantId);

    // Build a count map: categoryId → item count
    const countMap: Record<string, number> = {};
    for (const item of items) {
      const catId = (item.categoryId as any)._id.toString();
      countMap[catId] = (countMap[catId] ?? 0) + 1;
    }

    const categorySummaries = categories
      .map((cat: any) => ({
        id: cat._id,
        _id: cat._id,
        name: cat.name,
        image: cat.image,
        displayOrder: cat.displayOrder,
        itemCount: countMap[cat._id.toString()] ?? 0,
      }))
      .filter((cat) => cat.itemCount > 0);

    return {
      restaurant: {
        id: restaurant._id,
        _id: restaurant._id,
        name: restaurant.name,
        slug: restaurant.slug,
        logo: (restaurant as any).logo,
        theme: restaurant.theme,
        currency: restaurant.defaultSettings.currency,
      },
      categories: categorySummaries,
    };
  }

  // ─── GET /public/menu/:restaurantSlug ─────────────────────────────────────
  // Full menu — categories + all items grouped under each category.
  // Used by the menu-list page.
  async getMenuBySlug(restaurantSlug: string) {
    const restaurant = await this.restaurantRepo.findBySlug(restaurantSlug);
    if (!restaurant || !restaurant.isActive) {
      throw new AppError('Restaurant not found', 404);
    }

    const menu = await this.getGroupedMenu(restaurant._id.toString());

    return {
      restaurant: {
        id: restaurant._id,
        _id: restaurant._id,
        name: restaurant.name,
        slug: restaurant.slug,
        logo: (restaurant as any).logo,
        theme: restaurant.theme,
        currency: restaurant.defaultSettings.currency,
      },
      menu,
    };
  }

  // ─── GET /public/restaurant/:restaurantSlug ───────────────────────────────
  async getRestaurantInfo(restaurantSlug: string) {
    const restaurant = await this.restaurantRepo.findBySlug(restaurantSlug);
    if (!restaurant || !restaurant.isActive) {
      throw new AppError('Restaurant not found', 404);
    }
    return {
      id: restaurant._id,
      _id: restaurant._id,
      name: restaurant.name,
      slug: restaurant.slug,
      theme: restaurant.theme,
    };
  }

  // ─── Helper ───────────────────────────────────────────────────────────────
  private async getGroupedMenu(restaurantId: string) {
    const categories = await this.categoryRepo.findAllForMenu(restaurantId);
    const rawItems = await this.menuItemRepo.findAllForMenu(restaurantId);

    const grouped = categories.map((category: any) => {
      const items = rawItems
        .filter((item: any) => item.categoryId._id.toString() === category._id.toString())
        .map((item: any) => ({
          id: item._id,
          _id: item._id,
          name: item.name,
          description: item.description,
          image: item.image,
          images: item.images,
          price: item.price,
          discountPrice: item.discountPrice,
          preparationTime: item.preparationTime,
          calories: item.calories,
          spiceLevel: item.spiceLevel,
          itemType: item.itemType,
          dietaryType: item.dietaryType,
          isAvailable: item.isAvailable,
        }));

      return {
        id: category._id,
        _id: category._id,
        name: category.name,
        description: category.description,
        image: category.image,
        displayOrder: category.displayOrder,
        items,
      };
    });

    return grouped.filter((cat) => cat.items.length > 0);
  }
}
