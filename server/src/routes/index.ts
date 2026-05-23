// src/routes/index.ts
import { Router } from 'express';
import { authRoutes } from '@/modules/auth';
import { restaurantRoutes, taxRoutes, qrConfigRoutes, feedbackRoutes } from '@/modules/restaurant';
import { staffRoutes } from '@/modules/staff';
import { categoryRoutes, menuItemRoutes, publicMenuRoutes, modifierRoutes } from '@/modules/menu';
import { tableRoutes } from '@/modules/table';
import { ApiLogController } from '@/modules/analytics/api-log.controller';
import { AuthMiddleware } from '@/modules/staff';
import { StaffRole } from '@/types/role.types';
import healthRoutes from './health.route';

const router = Router();
const apiLogController = new ApiLogController();

router.use('/health', healthRoutes);
router.use('/superadmin/auth', authRoutes);

// Admin Logs
router.get(
  '/superadmin/logs',
  AuthMiddleware.authenticate,
  AuthMiddleware.authorizeRoles(StaffRole.SUPER_ADMIN),
  apiLogController.getLogs
);
router.use('/restaurants', restaurantRoutes);
router.use('/staff', staffRoutes);

// Table Management
router.use('/restaurants/:restaurantId/tables', tableRoutes);
router.use('/tables', tableRoutes); // For QR code access

// Category Management (nested under restaurants)
router.use('/restaurants/:restaurantId/categories', categoryRoutes);

// Menu Item Management (nested under restaurants)
router.use('/restaurants/:restaurantId/menu-items', menuItemRoutes);

// Modifier Management (nested under restaurants)
router.use('/restaurants/:restaurantId/modifiers', modifierRoutes);

// Tax Management
router.use('/restaurants/:restaurantId/taxes', taxRoutes);

// QR Config Management (nested under restaurants)
router.use('/restaurants/:restaurantId/qr-config', qrConfigRoutes);

// Feedback Management
router.use('/restaurants/:restaurantId/feedback', feedbackRoutes);

// Register public routes (no auth required)
router.use('/public', publicMenuRoutes);

export default router;
