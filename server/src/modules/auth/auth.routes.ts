// server/src/modules/auth/auth.routes.ts
import { Router } from 'express';
import { AuthController } from './auth.controller';
import { AuthMiddleware } from '@/modules/staff';
import { StaffRole } from '@/types/role.types';

const router = Router();
const authController = new AuthController();

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);

// Protected routes (Super Admin only)
router.get(
  '/profile',
  AuthMiddleware.authenticate,
  AuthMiddleware.authorizeRoles(StaffRole.SUPER_ADMIN),
  authController.getProfile
);

router.put(
  '/profile',
  AuthMiddleware.authenticate,
  AuthMiddleware.authorizeRoles(StaffRole.SUPER_ADMIN),
  authController.updateProfile
);

router.put(
  '/change-password',
  AuthMiddleware.authenticate,
  AuthMiddleware.authorizeRoles(StaffRole.SUPER_ADMIN),
  authController.changePassword
);

export default router;
