// src/routes/qrconfig.routes.ts
import { Router } from 'express';
import { QRConfigController } from '@/controllers/qrconfig.controller';
import { AuthMiddleware } from '@/middlewares/auth.middleware';
import { StaffRole } from '@/types/role.types';

const router = Router({ mergeParams: true });
const qrConfigController = new QRConfigController();

// All routes require authentication
router.use(AuthMiddleware.authenticate);

// Authorization helpers - only owners and managers can manage QR config
const canManageQRConfig = [
  AuthMiddleware.authorizeRoles(StaffRole.OWNER, StaffRole.BRANCH_MANAGER, StaffRole.MANAGER),
];

// Get QR config for restaurant
router.get('/', qrConfigController.getQRConfig);

// Create or update QR config
router.post('/', ...canManageQRConfig, qrConfigController.createOrUpdateQRConfig);

// Update QR config (same as create - upsert logic)
router.put('/', ...canManageQRConfig, qrConfigController.createOrUpdateQRConfig);

// Delete QR config
router.delete('/', ...canManageQRConfig, qrConfigController.deleteQRConfig);

// Reset QR config to defaults
router.post('/reset', ...canManageQRConfig, qrConfigController.resetQRConfig);

export default router;
