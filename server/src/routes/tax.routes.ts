// src/routes/tax.routes.ts
import { Router } from 'express';
import { TaxController } from '@/controllers/tax.controller';
import { AuthMiddleware } from '@/middlewares/auth.middleware';
import { StaffRole } from '@/types/role.types';

const router = Router({ mergeParams: true });
const taxController = new TaxController();

// Public route - Get applicable taxes for order calculation
router.get('/applicable', taxController.getApplicableTaxes);

// All other routes require authentication
router.use(AuthMiddleware.authenticate);

// Authorization helpers
const canManageTaxes = [
  AuthMiddleware.authorizeRoles(StaffRole.OWNER, StaffRole.BRANCH_MANAGER, StaffRole.MANAGER),
  // AuthMiddleware.authorizePermission('canManageSettings'),
];

// Create tax
router.post('/', ...canManageTaxes, taxController.createTax);

// Get all taxes by restaurant
router.get('/', taxController.getTaxesByRestaurant);

// 6950eacd17e23a7a41696359 sgst
// CGST 6950ea1117e23a7a41696356

// Get all taxes by branch
router.get('/branch/:branchId', taxController.getTaxesByBranch);

// Get single tax
router.get('/:id', taxController.getTax);

// Update tax
router.put('/:id', ...canManageTaxes, taxController.updateTax);

// Update tax status (activate/deactivate)
router.patch('/:id/status', ...canManageTaxes, taxController.updateTaxStatus);

// Delete tax
router.delete('/:id', ...canManageTaxes, taxController.deleteTax);

export default router;
