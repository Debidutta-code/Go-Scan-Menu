// src/routes/menuitem.routes.ts
import { Router } from 'express';
import { MenuItemController } from '@/controllers/menuitem.controller';
import { AuthMiddleware } from '@/middlewares/auth.middleware';
import { StaffRole } from '@/types/role.types';

const router = Router({ mergeParams: true });
const menuItemController = new MenuItemController();

// Public route - Get all menu items for customer menu
router.get('/menu', menuItemController.getAllMenuItemsForMenu);

// All other routes require authentication
router.use(AuthMiddleware.authenticate);

// Authorization helpers
const canManageMenu = [
  AuthMiddleware.authorizeRoles(StaffRole.OWNER, StaffRole.BRANCH_MANAGER, StaffRole.MANAGER),
  // AuthMiddleware.authorizePermission('canManageMenu'),
];

// Create menu item
router.post('/', ...canManageMenu, menuItemController.createMenuItem);

// Get all menu items by restaurant
router.get('/', menuItemController.getMenuItemsByRestaurant);

// Get all menu items by category
router.get('/category/:categoryId', menuItemController.getMenuItemsByCategory);

// Get all menu items by branch
router.get('/branch/:branchId', menuItemController.getMenuItemsByBranch);

// Get single menu item
router.get('/:id', menuItemController.getMenuItem);

// Update menu item
router.put('/:id', ...canManageMenu, menuItemController.updateMenuItem);

// Update availability (managers and waiters can do this)
router.patch(
  '/:id/availability',
  AuthMiddleware.authorizeRoles(StaffRole.OWNER, StaffRole.BRANCH_MANAGER, StaffRole.MANAGER, StaffRole.WAITER),
  menuItemController.updateAvailability
);

// Update branch-specific pricing
router.put(
  '/:id/branch/:branchId/pricing',
  ...canManageMenu,
  menuItemController.updateBranchPricing
);

// Delete menu item
router.delete('/:id', ...canManageMenu, menuItemController.deleteMenuItem);

export default router;
