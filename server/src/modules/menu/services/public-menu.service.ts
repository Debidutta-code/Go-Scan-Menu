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

  /**
   * Get complete menu data
   */
  async getMenuBySlug(restaurantSlug: string) {
    // 1. Get restaurant by slug
    const restaurant = await this.restaurantRepo.findBySlug(restaurantSlug);
    if (!restaurant || !restaurant.isActive) {
      throw new AppError('Restaurant not found', 404);
    }

    // 2. Get menu
    const menu = await this.getGroupedMenu(restaurant._id.toString());

    // 3. Return data
    return {
      restaurant: {
        id: restaurant._id,
        _id: restaurant._id,
        name: restaurant.name,
        slug: restaurant.slug,
        theme: restaurant.theme,
        currency: restaurant.defaultSettings.currency
      },
      menu,
    };
  }

  /**
   * Get basic restaurant info
   */
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

  /**
   * Helper: Get menu items grouped by categories
   */
  private async getGroupedMenu(restaurantId: string) {
    const categories = await this.categoryRepo.findAllForMenu(restaurantId);
    const rawItems = await this.menuItemRepo.findAllForMenu(restaurantId);

    const menuByCategory = categories.map((category: any) => {
      const categoryItems = rawItems
        .filter((item: any) => item.categoryId._id.toString() === category._id.toString())
        .map((item: any) => ({
            id: item._id,
            _id: item._id,
            name: item.name,
            description: item.description,
            image: item.image,
            price: item.price,
            discountPrice: item.discountPrice,
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
        items: categoryItems,
      };
    });

    return menuByCategory.filter((cat) => cat.items.length > 0);
  }
}
