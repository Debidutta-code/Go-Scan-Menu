// src/routes/staff.routes.ts
import { Router } from 'express';
import { StaffController } from '@/controllers/staff.controller';
import { AuthMiddleware } from '@/middlewares/auth.middleware';

const router = Router();
const staffController = new StaffController();

// Auth routes
router.post('/login', staffController.login);

// Protected routes
router.get('/me', AuthMiddleware.authenticate, staffController.getCurrentUser);

router.post(
  '/',
  AuthMiddleware.authenticate,
  AuthMiddleware.authorizeRoles('super_admin', 'owner', 'branch_manager'),
  AuthMiddleware.authorizePermission('canManageStaff'),
  staffController.createStaff
);

router.get('/:id', AuthMiddleware.authenticate, staffController.getStaff);

router.get(
  '/restaurant/:restaurantId',
  AuthMiddleware.authenticate,
  AuthMiddleware.authorizeRoles('super_admin', 'owner', 'branch_manager'),
  staffController.getStaffByRestaurant
);

router.get(
  '/branch/:branchId',
  AuthMiddleware.authenticate,
  AuthMiddleware.authorizeRoles('super_admin', 'owner', 'branch_manager', 'manager'),
  staffController.getStaffByBranch
);

router.put(
  '/:id',
  AuthMiddleware.authenticate,
  AuthMiddleware.authorizeRoles('super_admin', 'owner', 'branch_manager'),
  AuthMiddleware.authorizePermission('canManageStaff'),
  staffController.updateStaff
);

router.put(
  '/:id/permissions',
  AuthMiddleware.authenticate,
  AuthMiddleware.authorizeRoles('super_admin', 'owner', 'branch_manager'),
  AuthMiddleware.authorizePermission('canManageStaff'),
  staffController.updatePermissions
);

router.delete(
  '/:id',
  AuthMiddleware.authenticate,
  AuthMiddleware.authorizeRoles('super_admin', 'owner', 'branch_manager'),
  AuthMiddleware.authorizePermission('canManageStaff'),
  staffController.deleteStaff
);

export default router;
