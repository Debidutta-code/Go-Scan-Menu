import { RestaurantRepository } from '../../restaurant/repositories/restaurant.repository';
import { TableRepository } from '../../table/repositories/table.repository';
import { CategoryRepository } from '../repositories/category.repository';
import { MenuItemRepository } from '../repositories/menu-item.repository';
import { AppError } from '@/utils/AppError';
import { ParamsUtil } from '@/utils';
import mongoose from 'mongoose';

export class PublicMenuService {
  private restaurantRepo: RestaurantRepository;
  private tableRepo: TableRepository;
  private categoryRepo: CategoryRepository;
  private menuItemRepo: MenuItemRepository;

  constructor() {
    this.restaurantRepo = new RestaurantRepository();
    this.tableRepo = new TableRepository();
    this.categoryRepo = new CategoryRepository();
    this.menuItemRepo = new MenuItemRepository();
  }

  /**
   * Get initial public data (restaurant and table info)
   */
  async getPublicInitData(restaurantSlug: string, qrCode?: string) {
    const restaurant = await this.restaurantRepo.findBySlug(restaurantSlug);
    if (!restaurant || !restaurant.isActive) {
      throw new AppError('Restaurant not found', 404);
    }

    let table = null;
    if (qrCode) {
      table = await this.tableRepo.findByQrCode(qrCode);
      if (!table || !table.isActive) {
        throw new AppError('Invalid QR code', 404);
      }

      const tableRestaurantId = ParamsUtil.extractId(table.restaurantId);
      const actualRestaurantId = ParamsUtil.extractId(restaurant._id);

      if (tableRestaurantId !== actualRestaurantId) {
        throw new AppError('QR code does not belong to this restaurant', 400);
      }
    }

    return {
      restaurant: {
        id: restaurant._id,
        _id: restaurant._id,
        name: restaurant.name,
        slug: restaurant.slug,
        theme: restaurant.theme,
        logo: restaurant.theme?.logo,
        googlePlaceId: restaurant.googlePlaceId,
        googleReviewEnabled: restaurant.googleReviewEnabled,
        settings: {
          currency: restaurant.defaultSettings?.currency || 'USD'
        }
      },
      table: table ? {
        id: table._id,
        _id: table._id,
        tableNumber: table.tableNumber,
        capacity: table.capacity,
        location: table.location,
        status: table.status,
      } : null
    };
  }

  /**
   * Get only categories for a restaurant
   */
  async getPublicCategories(restaurantSlug: string) {
    const restaurant = await this.restaurantRepo.findBySlug(restaurantSlug);
    if (!restaurant || !restaurant.isActive) {
      throw new AppError('Restaurant not found', 404);
    }

    const categories = await this.categoryRepo.findAllForMenu(restaurant._id.toString());

    return categories.map(cat => ({
      id: cat._id,
      _id: cat._id,
      name: cat.name,
      description: cat.description,
      image: cat.image,
      displayOrder: cat.displayOrder
    }));
  }

  /**
   * Get complete menu data (categories with items)
   */
  async getPublicMenu(restaurantSlug: string) {
    const restaurant = await this.restaurantRepo.findBySlug(restaurantSlug);
    if (!restaurant || !restaurant.isActive) {
      throw new AppError('Restaurant not found', 404);
    }

    return this.getGroupedMenu(restaurant._id.toString());
  }

  /**
   * Get complete menu data when customer scans QR code
   * Returns everything needed to display menu
   * @deprecated Use granular methods
   */
  async getCompleteMenuByQrCode(restaurantSlug: string, qrCode: string) {
    const initData = await this.getPublicInitData(restaurantSlug, qrCode);
    const menu = await this.getPublicMenu(restaurantSlug);

    return {
      ...initData,
      menu,
    };
  }

  /**
   * Get menu without specific table (for browsing)
   * @deprecated Use granular methods
   */
  async getCompleteMenuByBranch(restaurantSlug: string) {
    const initData = await this.getPublicInitData(restaurantSlug);
    const menu = await this.getPublicMenu(restaurantSlug);

    return {
      ...initData,
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
      _id: restaurant._id,
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
  private async getGroupedMenu(restaurantId: string) {
    // Get all categories
    const categories = await this.categoryRepo.findAllForMenu(restaurantId);

    // Get all menu items
    const rawItems = await this.menuItemRepo.findAllForMenu(restaurantId);

    // Optimization: Bulk fetch all referenced modifier groups and options to avoid N+1
    const groupIds = new Set<string>();
    rawItems.forEach((item: any) => {
        item.modifierGroups?.forEach((mg: any) => groupIds.add(mg.groupId.toString()));
    });

    const ModifierGroup = mongoose.model('ModifierGroup');
    const ModifierOption = mongoose.model('ModifierOption');

    const allGroups = await ModifierGroup.find({ _id: { $in: Array.from(groupIds) } }).populate('options').lean() as any[];
    const groupsMap = new Map(allGroups.map(g => [g._id.toString(), g]));

    // Group items by category and transform
    const menuByCategory = categories.map((category: any) => {
      const categoryItems = rawItems
        .filter((item: any) => item.categoryId._id.toString() === category._id.toString())
        .map((item: any) => {
            // Process modifiers for this item
            const populatedModifierGroups = (item.modifierGroups || []).map((mg: any) => {
                const globalGroup = groupsMap.get(mg.groupId.toString());
                if (!globalGroup) return null;

                const options = (globalGroup.options as any[]).map((opt: any) => {
                    const override = mg.overrides.find((o: any) => o.optionId.toString() === opt._id.toString());
                    return {
                        ...opt,
                        price: override && override.price !== undefined ? override.price : opt.price,
                        isAvailable: override && override.isAvailable !== undefined ? override.isAvailable : opt.isAvailable
                    };
                });

                return {
                    ...globalGroup,
                    options,
                    isRequired: mg.isRequired !== undefined ? mg.isRequired : globalGroup.isRequired,
                    isMultiSelect: mg.isMultiSelect !== undefined ? mg.isMultiSelect : globalGroup.isMultiSelect,
                    minSelections: mg.minSelections !== undefined ? mg.minSelections : globalGroup.minSelections,
                    maxSelections: mg.maxSelections !== undefined ? mg.maxSelections : globalGroup.maxSelections,
                    displayOrder: mg.displayOrder
                };
            }).filter(Boolean);

            return {
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
                tags: item.tags,
                allergens: item.allergens,
                modifierGroups: populatedModifierGroups,
                variants: item.variants,
                addons: item.addons,
                customizations: item.customizations,
                isAvailable: item.isAvailable,
                availableQuantity: item.availableQuantity,
                dietaryType: item.dietaryType,
            };
        });

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
