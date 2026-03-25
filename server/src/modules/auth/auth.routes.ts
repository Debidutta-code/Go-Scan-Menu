// server/src/modules/auth/auth.routes.ts
import { Router } from 'express';
import { AuthController } from './auth.controller';
import { SuperAdminAuthMiddleware } from './auth.middleware';

const router = Router();
const authController = new AuthController();

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);

// Protected routes (Super Admin only)
router.get(
  '/profile',
  SuperAdminAuthMiddleware.authenticate,
  authController.getProfile
);

router.put(
  '/profile',
  SuperAdminAuthMiddleware.authenticate,
  authController.updateProfile
);

router.put(
  '/change-password',
  SuperAdminAuthMiddleware.authenticate,
  authController.changePassword
);

export default router;
