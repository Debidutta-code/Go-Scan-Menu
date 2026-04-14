import { Router } from 'express';
import { RoleController } from './controllers/role.controller';
import { AuthMiddleware } from './staff.middleware';
import { StaffRole } from '@/types/role.types';

const router = Router();
const roleController = new RoleController();

// All routes require authentication
router.use(AuthMiddleware.authenticate);

// Get all staff type permissions for a restaurant
router.get(
  '/:restaurantId',
  AuthMiddleware.authorizeRoles(StaffRole.SUPER_ADMIN, StaffRole.OWNER, StaffRole.BRANCH_MANAGER),
  roleController.getAllRestaurantStaffTypePermissions
);

// Initialize all default permissions for a restaurant
router.post(
  '/:restaurantId/initialize',
  AuthMiddleware.authorizeRoles(StaffRole.SUPER_ADMIN, StaffRole.OWNER),
  roleController.initializeRestaurantPermissions
);

// Get permissions for a specific staff type
router.get(
  '/:restaurantId/:staffType',
  AuthMiddleware.authorizeRoles(StaffRole.SUPER_ADMIN, StaffRole.OWNER, StaffRole.BRANCH_MANAGER),
  roleController.getPermissionsForStaffType
);

// Update permissions for a specific staff type
router.put(
  '/:restaurantId/:staffType',
  AuthMiddleware.authorizeRoles(StaffRole.SUPER_ADMIN, StaffRole.OWNER),
  roleController.updatePermissionsForStaffType
);

export default router;
