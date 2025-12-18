// src/routes/index.ts
import { Router } from 'express';
import superAdminAuthRoutes from './superadmin.auth.route';
import restaurantRoutes from './restaurant.routes';
import staffRoutes from './staff.routes';

const router = Router();

router.use('/super-admin/auth', superAdminAuthRoutes);
router.use('/restaurants', restaurantRoutes);
router.use('/staff', staffRoutes);

export default router;