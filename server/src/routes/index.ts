import { Router } from 'express';
import { authRoutes } from '@/modules/auth';
import { restaurantRoutes } from '@/modules/restaurant';
import { staffRoutes, roleRoutes, staffTypePermissionRoutes } from '@/modules/staff';
import { categoryRoutes, menuItemRoutes, publicMenuRoutes } from '@/modules/menu';
import healthRoutes from './health.route';

const router = Router();

router.use('/health', healthRoutes);
router.use('/superadmin/auth', authRoutes);

router.use('/restaurants', restaurantRoutes);
router.use('/staff', staffRoutes);
router.use('/roles', roleRoutes);
router.use('/staff-type-permissions', staffTypePermissionRoutes);

// Category Management (nested under restaurants)
router.use('/restaurants/:restaurantId/categories', categoryRoutes);

// Menu Item Management (nested under restaurants)
router.use('/restaurants/:restaurantId/menu-items', menuItemRoutes);

// Register public routes (no auth required)
router.use('/public', publicMenuRoutes);

export default router;
