// FILE 4: src/routes/superadmin.auth.route.ts
import { Router } from 'express';
import * as SuperAdminAuthController from '@/controllers/';
import { AuthMiddleware } from '@/middlewares';
import { StaffType } from '@/models/StaffTypePermissions.model';

const router = Router();

// Public routes
router.post('/register', SuperAdminAuthController.register);
router.post('/login', SuperAdminAuthController.login);

// Protected routes (Super Admin only)
router.get(
  '/profile',
  AuthMiddleware.authenticate,
  AuthMiddleware.authorizeStaffTypes(StaffType.SUPER_ADMIN),
  SuperAdminAuthController.getProfile
);

router.put(
  '/profile',
  AuthMiddleware.authenticate,
  AuthMiddleware.authorizeStaffTypes(StaffType.SUPER_ADMIN),
  SuperAdminAuthController.updateProfile
);

router.put(
  '/change-password',
  AuthMiddleware.authenticate,
  AuthMiddleware.authorizeStaffTypes(StaffType.SUPER_ADMIN),
  SuperAdminAuthController.changePassword
);

export default router;