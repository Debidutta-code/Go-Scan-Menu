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
  staffController.createStaff
);

router.get('/:id', AuthMiddleware.authenticate, staffController.getStaff);

router.get(
  '/restaurant/:restaurantId',
  AuthMiddleware.authenticate,
  staffController.getStaffByRestaurant
);

router.get(
  '/branch/:branchId',
  AuthMiddleware.authenticate,
  staffController.getStaffByBranch
);

router.put(
  '/:id',
  AuthMiddleware.authenticate,
  staffController.updateStaff
);

router.put(
  '/:id/staff-type',
  AuthMiddleware.authenticate,
  staffController.updateStaffRole
);

router.delete(
  '/:id',
  AuthMiddleware.authenticate,
  staffController.deleteStaff
);

export default router;