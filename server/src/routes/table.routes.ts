// src/routes/table.routes.ts
import { Router } from 'express';
import { TableController } from '@/controllers/table.controller';
import { AuthMiddleware } from '@/middlewares/auth.middleware';
import { StaffRole } from '@/types/role.types';

const router = Router({ mergeParams: true });
const tableController = new TableController();

// Public route - Get table by QR code (for customers scanning)
router.get('/qr/:qrCode', tableController.getTableByQrCode);

// All other routes require authentication
router.use(AuthMiddleware.authenticate);

// Authorization helpers
const canManageTables = [
  AuthMiddleware.authorizeRoles(StaffRole.OWNER, StaffRole.BRANCH_MANAGER, StaffRole.MANAGER),
  // AuthMiddleware.authorizePermission('canManageSettings'),
];

// Create table
router.post('/', ...canManageTables, tableController.createTable);

// Get all tables by branch
router.get('/branch/:branchId', tableController.getTablesByBranch);

// Get all tables by restaurant
router.get('/', tableController.getTablesByRestaurant);

// Get single table
router.get('/:id', tableController.getTable);

// Update table
router.put('/:id', ...canManageTables, tableController.updateTable);

// Update table status (waiters can do this)
router.patch(
  '/:id/status',
  AuthMiddleware.authorizeRoles(StaffRole.OWNER, StaffRole.BRANCH_MANAGER, StaffRole.MANAGER, StaffRole.WAITER),
  tableController.updateTableStatus
);

// Regenerate QR code
router.post('/:id/regenerate-qr', ...canManageTables, tableController.regenerateQrCode);

// Get QR code data URL
router.get('/:id/qr-data', ...canManageTables, tableController.getQrCodeData);

// Generate QR code image (PNG) - uses query token auth for <img> tag compatibility
router.get(
  '/:id/qr-image',
  AuthMiddleware.authenticateWithQueryToken,
  AuthMiddleware.authorizeRoles(StaffRole.OWNER, StaffRole.BRANCH_MANAGER, StaffRole.MANAGER),
  tableController.generateQrCodeImage
);

// Delete table
router.delete('/:id', ...canManageTables, tableController.deleteTable);

export default router;
