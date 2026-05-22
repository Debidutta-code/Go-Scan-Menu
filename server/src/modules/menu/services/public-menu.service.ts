import { RestaurantRepository } from '../../restaurant/repositories/restaurant.repository';
import { BranchRepository } from '../../restaurant/repositories/branch.repository';
import { TableRepository } from '../../table/repositories/table.repository';
import { CategoryRepository } from '../repositories/category.repository';
import { MenuItemRepository } from '../repositories/menu-item.repository';
import { AppError } from '@/utils/AppError';
import mongoose from 'mongoose';

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
        _id: restaurant._id,
        name: restaurant.name,
        slug: restaurant.slug,
        theme: restaurant.theme,
        googlePlaceId: restaurant.googlePlaceId,
        googleReviewEnabled: restaurant.googleReviewEnabled,
      },
      branch: {
        id: branch._id,
        _id: branch._id,
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
        _id: table._id,
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
        _id: restaurant._id,
        name: restaurant.name,
        slug: restaurant.slug,
        theme: restaurant.theme,
        googlePlaceId: restaurant.googlePlaceId,
        googleReviewEnabled: restaurant.googleReviewEnabled,
      },
      branch: {
        id: branch._id,
        _id: branch._id,
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
  private async getGroupedMenu(restaurantId: string, branchId: string) {
    // Get all categories for this branch
    const categories = await this.categoryRepo.findAllForMenu(restaurantId, branchId);

    // Get all menu items for this branch
    const rawItems = await this.menuItemRepo.findAllForMenu(restaurantId, branchId);

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
