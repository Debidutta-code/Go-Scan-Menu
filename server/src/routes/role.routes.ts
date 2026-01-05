// src/routes/role.routes.ts
import { Router } from 'express';
import { RoleController } from '@/controllers/role.controller';
import { AuthMiddleware } from '@/middlewares/auth.middleware';

const router = Router();
const roleController = new RoleController();

// All role routes require authentication
router.use(AuthMiddleware.authenticate);

// Get all roles (accessible to staff who can manage staff)
router.get(
  '/',
  AuthMiddleware.authorizeRoles('super_admin', 'owner', 'branch_manager'),
  AuthMiddleware.authorizePermission('canManageStaff'),
  roleController.getAllRoles
);

// Get system roles (accessible to those who can manage staff)
router.get(
  '/system',
  AuthMiddleware.authorizeRoles('super_admin', 'owner', 'branch_manager'),
  AuthMiddleware.authorizePermission('canManageStaff'),
  roleController.getSystemRoles
);

// Get single role
router.get(
  '/:id',
  AuthMiddleware.authorizeRoles('super_admin', 'owner', 'branch_manager'),
  roleController.getRole
);

// Update role (only super_admin and owner can modify roles)
router.put(
  '/:id',
  AuthMiddleware.authorizeRoles('super_admin', 'owner'),
  roleController.updateRole
);

// Update role permissions
router.put(
  '/:id/permissions',
  AuthMiddleware.authorizeRoles('super_admin', 'owner'),
  roleController.updateRolePermissions
);

// Delete role (cannot delete system roles - handled in service)
router.delete(
  '/:id',
  AuthMiddleware.authorizeRoles('super_admin', 'owner'),
  roleController.deleteRole
);

export default router;
