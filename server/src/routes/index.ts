// src/routes/index.ts
import { Router } from 'express';
import { authRoutes } from '@/modules/auth';
import { restaurantRoutes, branchRoutes, taxRoutes, qrConfigRoutes } from '@/modules/restaurant';
import { staffRoutes, roleRoutes } from '@/modules/staff';
import { categoryRoutes, menuItemRoutes, publicMenuRoutes } from '@/modules/menu';
import { orderRoutes } from '@/modules/order';
import { tableRoutes } from '@/modules/table';
import healthRoutes from './health.route';

const router = Router();

router.use('/health', healthRoutes);
router.use('/superadmin/auth', authRoutes);
router.use('/restaurants', restaurantRoutes);
router.use('/staff', staffRoutes);
router.use('/roles', roleRoutes);

// Branch Management
router.use('/restaurants/:restaurantId/branches', branchRoutes);

// Table Management (can be accessed via restaurant or branch)
router.use('/restaurants/:restaurantId/tables', tableRoutes);
router.use('/tables', tableRoutes); // For QR code access

// Category Management (nested under restaurants)
router.use('/restaurants/:restaurantId/categories', categoryRoutes);

// Menu Item Management (nested under restaurants)
router.use('/restaurants/:restaurantId/menu-items', menuItemRoutes);

// Tax Management
router.use('/restaurants/:restaurantId/taxes', taxRoutes);

// Order Management (nested under restaurants)
router.use('/restaurants/:restaurantId/orders', orderRoutes);

// QR Config Management (nested under restaurants)
router.use('/restaurants/:restaurantId/qr-config', qrConfigRoutes);

// Register public routes (no auth required)
router.use('/public', publicMenuRoutes);

export default router;
