// FILE 12: src/routes/superadmin.auth.route.ts
import { Router } from 'express';
import { SuperAdminAuthController } from '../controllers/superadmin.auth.controller';
import { SuperAdminAuthMiddleware } from '../middlewares/superadmin.auth.middleware';

const router = Router();
const controller = new SuperAdminAuthController();

// Public routes
router.post('/register', controller.register);
router.post('/login', controller.login);

// Protected routes
router.get('/profile', SuperAdminAuthMiddleware.authenticate, controller.getProfile);
router.put('/profile', SuperAdminAuthMiddleware.authenticate, controller.updateProfile);
router.put('/change-password', SuperAdminAuthMiddleware.authenticate, controller.changePassword);

export default router;
