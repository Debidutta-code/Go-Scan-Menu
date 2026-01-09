// src/routes/index.ts
import { Router } from 'express';
import superAdminAuthRoutes from './superadmin.auth.route';
import restaurantRoutes from './restaurant.routes';
import staffRoutes from './staff.routes';
import staffTypePermissionsRoutes from './staffTypePermissions.routes';
import healthRoutes from './health.route';
import branchRoutes from './branch.routes';
import tableRoutes from './table.routes';
import categoryRoutes from './category.routes';
import menuItemRoutes from './menuitem.routes';
import publicMenuRoutes from './public.menu.routes';
import taxRoutes from './tax.routes';
import orderRoutes from './order.routes';

const router = Router();

router.use('/health', healthRoutes);
router.use('/superadmin/auth', superAdminAuthRoutes);
router.use('/restaurants', restaurantRoutes);
router.use('/staff', staffRoutes);
router.use('/staff-type-permissions', staffTypePermissionsRoutes);
// router.use('/:restaurantId/branches', branchRoutes);
router.use('/restaurants/:restaurantId/branches', branchRoutes);

// Table Management (can be accessed via restaurant or branch)
router.use('/restaurants/:restaurantId/tables', tableRoutes);
router.use('/tables', tableRoutes); // For QR code access

// Category Management (nested under restaurants)
router.use('/restaurants/:restaurantId/categories', categoryRoutes);

// Menu Item Management (nested under restaurants)
router.use('/restaurants/:restaurantId/menu-items', menuItemRoutes);

// Create Tex
router.use('/restaurants/:restaurantId/taxes', taxRoutes);

// Order Management (nested under restaurants)
router.use('/restaurants/:restaurantId/orders', orderRoutes);

// Register public routes (no auth required)
router.use('/public', publicMenuRoutes);

export default router;
