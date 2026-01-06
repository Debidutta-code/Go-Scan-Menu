// src/routes/staff.routes.ts
import { Router } from 'express';
import { StaffController } from '@/controllers/staff.controller';
import { AuthMiddleware } from '@/middlewares/auth.middleware';
import { StaffRole } from '@/types/role.types';

const router = Router();
const staffController = new StaffController();

// Auth routes
router.post('/login', staffController.login);

// Protected routes
router.get('/me', AuthMiddleware.authenticate, staffController.getCurrentUser);

router.post(
  '/',
  AuthMiddleware.authenticate,
  AuthMiddleware.authorizeRoles(StaffRole.SUPER_ADMIN, StaffRole.OWNER, StaffRole.BRANCH_MANAGER),
  AuthMiddleware.authorizePermission('staff', 'create'),
  staffController.createStaff
);

router.get('/:id', AuthMiddleware.authenticate, staffController.getStaff);

router.get(
  '/restaurant/:restaurantId',
  AuthMiddleware.authenticate,
  AuthMiddleware.authorizeRoles(StaffRole.SUPER_ADMIN, StaffRole.OWNER, StaffRole.BRANCH_MANAGER),
  staffController.getStaffByRestaurant
);

router.get(
  '/branch/:branchId',
  AuthMiddleware.authenticate,
  AuthMiddleware.authorizeRoles(StaffRole.SUPER_ADMIN, StaffRole.OWNER, StaffRole.BRANCH_MANAGER),
  staffController.getStaffByBranch
);

router.put(
  '/:id',
  AuthMiddleware.authenticate,
  AuthMiddleware.authorizeRoles(StaffRole.SUPER_ADMIN, StaffRole.OWNER, StaffRole.BRANCH_MANAGER),
  AuthMiddleware.authorizePermission('staff', 'update'),
  staffController.updateStaff
);

router.put(
  '/:id/role',
  AuthMiddleware.authenticate,
  AuthMiddleware.authorizeRoles(StaffRole.SUPER_ADMIN, StaffRole.OWNER, StaffRole.BRANCH_MANAGER),
  AuthMiddleware.authorizePermission('staff', 'manageRoles'),
  staffController.updateStaffRole
);

router.delete(
  '/:id',
  AuthMiddleware.authenticate,
  AuthMiddleware.authorizeRoles(StaffRole.SUPER_ADMIN, StaffRole.OWNER, StaffRole.BRANCH_MANAGER),
  AuthMiddleware.authorizePermission('staff', 'delete'),
  staffController.deleteStaff
);

export default router;
