// src/routes/index.ts
import { Router } from 'express';
import superAdminAuthRoutes from './superadmin.auth.route';
import restaurantRoutes from './restaurant.routes';
import staffRoutes from './staff.routes';
import healthRoutes from './health.route';
import branchRoutes from './branch.routes';

const router = Router();

router.use('/health', healthRoutes);
router.use('/super-admin/auth', superAdminAuthRoutes);
router.use('/restaurants', restaurantRoutes);
router.use('/staff', staffRoutes);
router.use('/:restaurantId/branches', branchRoutes);

export default router;