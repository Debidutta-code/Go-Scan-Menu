// src/routes/branch.routes.ts
import { Router } from 'express';
import { BranchController } from '@/controllers/branch.controller';
import { AuthMiddleware } from '@/middlewares/auth.middleware';
import { StaffRole } from '@/types/role.types';

const router = Router({ mergeParams: true }); // Important: to access :restaurantId
const branchController = new BranchController();

// All routes require authentication
router.use(AuthMiddleware.authenticate);

// Role + permission checks
const canManageBranches = [
  AuthMiddleware.authorizeRoles(StaffRole.OWNER, StaffRole.BRANCH_MANAGER),
  // AuthMiddleware.authorizePermission('canManageSettings'), // or create a new one like canManageBranches
];

// Create branch
router.post('/', ...canManageBranches, branchController.createBranch);

// Get all branches
router.get('/', branchController.getBranches);

// Get single branch
router.get('/:id', branchController.getBranch);

// Update basic info
router.put('/:id', ...canManageBranches, branchController.updateBranch);

// Update settings
router.put('/:id/settings', ...canManageBranches, branchController.updateBranchSettings);

// Assign/remove manager
router.put('/:id/manager', ...canManageBranches, branchController.assignManager);

// Delete branch
router.delete('/:id', ...canManageBranches, branchController.deleteBranch);

export default router;
