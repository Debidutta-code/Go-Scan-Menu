// src/routes/restaurant.routes.ts
import { Router } from 'express';
import { RestaurantController } from '@/controllers/restaurant.controller';
import { AuthMiddleware } from '@/middlewares/auth.middleware';
import { StaffRole } from '@/types/role.types';

const router = Router();
const restaurantController = new RestaurantController();

// Public routes
router.get('/slug/:slug', restaurantController.getRestaurantBySlug);

// Protected routes - Super Admin only
router.post(
  '/',
  AuthMiddleware.authenticate,
  AuthMiddleware.authorizeRoles(StaffRole.SUPER_ADMIN),
  restaurantController.createRestaurant
);

router.get(
  '/',
  AuthMiddleware.authenticate,
  AuthMiddleware.authorizeRoles(StaffRole.SUPER_ADMIN),
  restaurantController.getAllRestaurants
);

router.get(
  '/:id',
  AuthMiddleware.authenticate,
  AuthMiddleware.authorizeRoles(StaffRole.SUPER_ADMIN, StaffRole.OWNER),
  restaurantController.getRestaurant
);
router.put(
  '/:id',
  AuthMiddleware.authenticate,
  AuthMiddleware.authorizeRoles('super_admin', 'owner'),
  restaurantController.updateRestaurant
); // Separate endpoints for theme, subscription, and settings
router.put(
  '/:id/theme',
  AuthMiddleware.authenticate,
  AuthMiddleware.authorizeRoles('super_admin', 'owner'),
  restaurantController.updateTheme
);
router.put(
  '/:id/subscription',
  AuthMiddleware.authenticate,
  AuthMiddleware.authorizeRoles('super_admin'),
  restaurantController.updateSubscription
);
router.put(
  '/:id/settings',
  AuthMiddleware.authenticate,
  AuthMiddleware.authorizeRoles('super_admin', 'owner'),
  // AuthMiddleware.authorizePermission('canManageSettings'),
  restaurantController.updateDefaultSettings
);
router.delete(
  '/:id',
  AuthMiddleware.authenticate,
  AuthMiddleware.authorizeRoles('super_admin'),
  restaurantController.deleteRestaurant
);
export default router;
