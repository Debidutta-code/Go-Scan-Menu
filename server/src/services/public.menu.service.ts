import { RestaurantRepository } from '@/repositories/restaurant.repository';
import { BranchRepository } from '@/repositories/branch.repository';
import { TableRepository } from '@/repositories/table.repository';
import { CategoryRepository } from '@/repositories/category.repository';
import { MenuItemRepository } from '@/repositories/menuitem.repository';
import { AppError } from '@/utils/AppError';

export class PublicMenuService {
  private restaurantRepo: RestaurantRepository;
  private branchRepo: BranchRepository;
  private tableRepo: TableRepository;
  private categoryRepo: CategoryRepository;
  private menuItemRepo: MenuItemRepository;

  constructor() {
    this.restaurantRepo = new RestaurantRepository();
    this.branchRepo = new BranchRepository();
    this.tableRepo = new TableRepository();
    this.categoryRepo = new CategoryRepository();
    this.menuItemRepo = new MenuItemRepository();
  }

  /**
   * Get complete menu data when customer scans QR code
   * Returns everything needed to display menu and start ordering
   */
  async getCompleteMenuByQrCode(restaurantSlug: string, branchCode: string, qrCode: string) {
    // 1. Get restaurant by slug
    const restaurant = await this.restaurantRepo.findBySlug(restaurantSlug);
    if (!restaurant || !restaurant.isActive) {
      throw new AppError('Restaurant not found', 404);
    }

    // 2. Get branch by code
    const branch = await this.branchRepo.findByCodeAndRestaurant(
      branchCode,
      restaurant._id.toString()
    );
    if (!branch || !branch.isActive) {
      throw new AppError('Branch not found', 404);
    }

    // 3. Verify QR code and get table
    const table = await this.tableRepo.findByQrCode(qrCode);
    if (!table || !table.isActive) {
      throw new AppError('Invalid QR code', 404);
    }

    // Verify table belongs to this branch
    if (table.branchId._id.toString() !== branch._id.toString()) {
      throw new AppError('QR code does not belong to this branch', 400);
    }

    // Verify branch is accepting orders
    if (!branch.settings.acceptOrders) {
      throw new AppError('This branch is currently not accepting orders', 400);
    }

    // 4. Get menu (categories + items) grouped by category
    const menu = await this.getGroupedMenu(restaurant._id.toString(), branch._id.toString());

    // 5. Return complete data
    return {
      restaurant: {
        id: restaurant._id,
        name: restaurant.name,
        slug: restaurant.slug,
        theme: restaurant.theme,
      },
      branch: {
        id: branch._id,
        name: branch.name,
        code: branch.code,
        address: branch.address,
        phone: branch.phone,
        settings: {
          currency: branch.settings.currency,
          minOrderAmount: branch.settings.minOrderAmount,
          deliveryAvailable: branch.settings.deliveryAvailable,
          takeawayAvailable: branch.settings.takeawayAvailable,
        },
      },
      table: {
        id: table._id,
        tableNumber: table.tableNumber,
        capacity: table.capacity,
        location: table.location,
        status: table.status,
      },
      menu,
    };
  }

  /**
   * Get menu without specific table (for browsing or takeaway)
   */
  async getCompleteMenuByBranch(restaurantSlug: string, branchCode: string) {
    // 1. Get restaurant by slug
    const restaurant = await this.restaurantRepo.findBySlug(restaurantSlug);
    if (!restaurant || !restaurant.isActive) {
      throw new AppError('Restaurant not found', 404);
    }

    // 2. Get branch by code
    const branch = await this.branchRepo.findByCodeAndRestaurant(
      branchCode,
      restaurant._id.toString()
    );
    if (!branch || !branch.isActive) {
      throw new AppError('Branch not found', 404);
    }

    // 3. Get menu
    const menu = await this.getGroupedMenu(restaurant._id.toString(), branch._id.toString());

    // 4. Return data (without table info)
    return {
      restaurant: {
        id: restaurant._id,
        name: restaurant.name,
        slug: restaurant.slug,
        theme: restaurant.theme,
      },
      branch: {
        id: branch._id,
        name: branch.name,
        code: branch.code,
        address: branch.address,
        phone: branch.phone,
        settings: {
          currency: branch.settings.currency,
          minOrderAmount: branch.settings.minOrderAmount,
          deliveryAvailable: branch.settings.deliveryAvailable,
          takeawayAvailable: branch.settings.takeawayAvailable,
        },
      },
      menu,
    };
  }

  /**
   * Get basic restaurant info (for landing pages)
   */
  async getRestaurantInfo(restaurantSlug: string) {
    const restaurant = await this.restaurantRepo.findBySlug(restaurantSlug);
    if (!restaurant || !restaurant.isActive) {
      throw new AppError('Restaurant not found', 404);
    }

    return {
      id: restaurant._id,
      name: restaurant.name,
      slug: restaurant.slug,
      type: restaurant.type,
      theme: restaurant.theme,
    };
  }

  /**
   * Helper: Get menu items grouped by categories
   * Returns structured data ready for frontend display
   */
  private async getGroupedMenu(restaurantId: string, branchId: string) {
    // Get all categories for this branch (restaurant-wide + branch-specific)
    const categories = await this.categoryRepo.findAllForMenu(restaurantId, branchId);

    // Get all menu items for this branch (with branch pricing applied)
    const items = await this.menuItemRepo.findAllForMenu(restaurantId, branchId);

    // Group items by category
    const menuByCategory = categories.map((category: any) => {
      const categoryItems = items.filter(
        (item: any) => item.categoryId._id.toString() === category._id.toString()
      );

      return {
        id: category._id,
        name: category.name,
        description: category.description,
        image: category.image,
        displayOrder: category.displayOrder,
        items: categoryItems.map((item: any) => ({
          id: item._id,
          name: item.name,
          description: item.description,
          image: item.image,
          images: item.images,
          price: item.price,
          discountPrice: item.discountPrice,
          preparationTime: item.preparationTime,
          calories: item.calories,
          spiceLevel: item.spiceLevel,
          tags: item.tags,
          allergens: item.allergens,
          variants: item.variants,
          addons: item.addons,
          customizations: item.customizations,
          isAvailable: item.isAvailable,
          availableQuantity: item.availableQuantity,
          dietaryType: item.dietaryType,
        })),
      };
    });

    // Filter out empty categories (categories with no available items)
    return menuByCategory.filter((cat) => cat.items.length > 0);
  }
}
