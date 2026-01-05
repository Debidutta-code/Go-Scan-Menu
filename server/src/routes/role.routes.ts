// src/routes/role.routes.ts
import { Router } from 'express';
import { RoleController } from '@/controllers/role.controller';
import { AuthMiddleware } from '@/middlewares/auth.middleware';
import { StaffRole } from '@/types/role.types';

const router = Router();
const roleController = new RoleController();

// All role routes require authentication
router.use(AuthMiddleware.authenticate);

// Get all roles (accessible to staff who can manage staff)
router.get(
  '/',
  AuthMiddleware.authorizeRoles(StaffRole.SUPER_ADMIN, StaffRole.OWNER, StaffRole.BRANCH_MANAGER),
  AuthMiddleware.authorizePermission('canManageStaff'),
  roleController.getAllRoles
);

// Get system roles (accessible to those who can manage staff)
router.get(
  '/system',
  AuthMiddleware.authorizeRoles(StaffRole.SUPER_ADMIN, StaffRole.OWNER, StaffRole.BRANCH_MANAGER),
  AuthMiddleware.authorizePermission('canManageStaff'),
  roleController.getSystemRoles
);

// Get single role
router.get(
  '/:id',
  AuthMiddleware.authorizeRoles(StaffRole.SUPER_ADMIN, StaffRole.OWNER, StaffRole.BRANCH_MANAGER),
  roleController.getRole
);

// Update role (only super_admin and owner can modify roles)
router.put(
  '/:id',
  AuthMiddleware.authorizeRoles(StaffRole.SUPER_ADMIN, StaffRole.OWNER),
  roleController.updateRole
);

// Update role permissions
router.put(
  '/:id/permissions',
  AuthMiddleware.authorizeRoles(StaffRole.SUPER_ADMIN, StaffRole.OWNER),
  roleController.updateRolePermissions
);

// Delete role (cannot delete system roles - handled in service)
router.delete(
  '/:id',
  AuthMiddleware.authorizeRoles(StaffRole.SUPER_ADMIN, StaffRole.OWNER),
  roleController.deleteRole
);

export default router;
