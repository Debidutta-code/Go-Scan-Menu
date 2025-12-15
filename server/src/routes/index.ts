import { Router } from 'express';
import authRoutes from './auth.routes';
import superadminAuthRoutes from './superadmin.auth.route';

const router = Router();

/**
 * /api/v1/auth
 * /api/v1/menu
 */
router.use('/auth', authRoutes);
// router.use('/menu', menuRoutes);
router.use('/superadmin', superadminAuthRoutes);

export default router;
