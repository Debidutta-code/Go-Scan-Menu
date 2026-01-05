// src/routes/category.routes.ts
import { Router } from 'express';
import { CategoryController } from '@/controllers/category.controller';
import { AuthMiddleware } from '@/middlewares/auth.middleware';
import { StaffRole } from '@/types/role.types';

const router = Router({ mergeParams: true });
const categoryController = new CategoryController();

// Public route - Get all categories for menu display
router.get('/menu', categoryController.getAllCategoriesForMenu);

// All other routes require authentication
router.use(AuthMiddleware.authenticate);

// Authorization helpers
const canManageMenu = [
  AuthMiddleware.authorizeRoles(StaffRole.OWNER, StaffRole.BRANCH_MANAGER, StaffRole.MANAGER),
  // AuthMiddleware.authorizePermission('canManageMenu'),
];

// Create category
router.post('/', ...canManageMenu, categoryController.createCategory);

// Get all categories by restaurant
router.get('/', categoryController.getCategoriesByRestaurant);

// Get all categories by branch
router.get('/branch/:branchId', categoryController.getCategoriesByBranch);

// Get single category
router.get('/:id', categoryController.getCategory);

// Update category
router.put('/:id', ...canManageMenu, categoryController.updateCategory);

// Update display order
router.patch('/:id/display-order', ...canManageMenu, categoryController.updateDisplayOrder);

// Delete category
// router.delete('/:id', ...canManageMenu, categoryController.deleteCategory);

export default router;
