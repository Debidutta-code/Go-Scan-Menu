// src/routes/index.ts
import { Router } from 'express';
import superAdminAuthRoutes from './superadmin.auth.route';
import restaurantRoutes from './restaurant.routes';
import staffRoutes from './staff.routes';
import healthRoutes from './health.route';
import branchRoutes from './branch.routes';
import tableRoutes from './table.routes';
import categoryRoutes from './category.routes';
import menuItemRoutes from './menuitem.routes';

const router = Router();

router.use('/health', healthRoutes);
router.use('/super-admin/auth', superAdminAuthRoutes);
router.use('/restaurants', restaurantRoutes);
router.use('/staff', staffRoutes);
router.use('/:restaurantId/branches', branchRoutes);

// Table Management (can be accessed via restaurant or branch)
router.use('/restaurants/:restaurantId/tables', tableRoutes);
router.use('/tables', tableRoutes); // For QR code access

// Category Management (nested under restaurants)
router.use('/restaurants/:restaurantId/categories', categoryRoutes);

// Menu Item Management (nested under restaurants)
router.use('/restaurants/:restaurantId/menu-items', menuItemRoutes);

export default router;