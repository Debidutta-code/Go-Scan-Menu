import { Router } from 'express';
import authRoutes from './auth.routes';

const router = Router();

/**
 * /api/v1/auth
 * /api/v1/menu
 */
router.use('/auth', authRoutes);
// router.use('/menu', menuRoutes);

export default router;
