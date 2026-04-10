// src/routes/customersession.routes.ts
import { Router } from 'express';
import { CustomerSessionController } from './controllers/customer-session.controller';
import { AuthMiddleware } from '@/modules/staff';
import { StaffRole } from '@/types/role.types';

const router = Router({ mergeParams: true });
const sessionController = new CustomerSessionController();

// Public routes - customers can create and access their sessions
router.post('/', sessionController.createSession);
router.get('/session/:sessionId', sessionController.getSession);
router.get('/table/:tableId/active', sessionController.getActiveSessionByTable);
router.patch('/session/:sessionId/theme', sessionController.updateThemePreference);
router.patch('/session/:sessionId/order', sessionController.updateActiveOrder);
router.patch('/session/:sessionId/activity', sessionController.updateActivity);
router.patch('/session/:sessionId/end', sessionController.endSession);

// Protected routes - staff only
router.use(AuthMiddleware.authenticate);

const canViewSessions = [
  AuthMiddleware.authorizeRoles(
    StaffRole.OWNER,
    StaffRole.BRANCH_MANAGER,
    StaffRole.MANAGER,
    StaffRole.WAITER
  ),
  AuthMiddleware.authorizePermission('orders', 'view'),
];

// Get active sessions by branch
router.get('/branch/:branchId/active', ...canViewSessions, sessionController.getActiveSessions);

export default router;
