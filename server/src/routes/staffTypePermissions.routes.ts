// Staff Type Permissions Routes
import { Router } from 'express';
import { StaffTypePermissionsController } from '@/controllers/staffTypePermissions.controller';
import { AuthMiddleware } from '@/middlewares/auth.middleware';

const router = Router();
const permissionsController = new StaffTypePermissionsController();

// All routes require authentication
router.use(AuthMiddleware.authenticate);

// GET all staff type permissions for a restaurant
router.get(
  '/:restaurantId',
  permissionsController.getAllStaffTypePermissions
);

// GET permissions for a specific staff type
router.get(
  '/:restaurantId/:staffType',
  permissionsController.getPermissionsForStaffType
);

// UPDATE permissions for a specific staff type
router.put(
  '/:restaurantId/:staffType',
  permissionsController.updatePermissionsForStaffType
);

// Initialize all default permissions for a restaurant
router.post(
  '/:restaurantId/initialize',
  permissionsController.initializeAllPermissions
);

export default router;
