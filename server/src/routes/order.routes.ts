// src/routes/order.routes.ts
import { Router } from 'express';
import { OrderController } from '@/controllers/order.controller';
import { AuthMiddleware } from '@/middlewares/auth.middleware';
import { StaffRole } from '@/types/role.types';

const router = Router({ mergeParams: true });
const orderController = new OrderController();

// All routes require authentication
// router.use(AuthMiddleware.authenticate);

// Authorization helpers
const canManageOrders = [
  AuthMiddleware.authorizeRoles(StaffRole.OWNER, StaffRole.BRANCH_MANAGER, StaffRole.MANAGER, StaffRole.WAITER),
  // AuthMiddleware.authorizePermission('canManageOrders'),
];

const canViewOrders = [
  AuthMiddleware.authorizeRoles(StaffRole.OWNER, StaffRole.BRANCH_MANAGER, StaffRole.MANAGER, StaffRole.WAITER, StaffRole.KITCHEN_STAFF),
  // AuthMiddleware.authorizePermission('canViewOrders'),
];

// Create order
router.post('/', orderController.createOrder);

// Get orders by branch
router.get('/branch/:branchId', orderController.getOrdersByBranch);

// Get orders by table
router.get('/table/:tableId', ...canViewOrders, orderController.getOrdersByTable);

// Get order by order number
router.get('/number/:orderNumber', ...canViewOrders, orderController.getOrderByNumber);

// Get single order
router.get('/:id', ...canViewOrders, orderController.getOrder);

// Update order status
router.patch('/:id/status', orderController.updateOrderStatus);

// Update item status
router.patch('/:id/items/:itemId/status', ...canManageOrders, orderController.updateItemStatus);

// Update payment status
router.patch(
  '/:id/payment',
  // ...canManageOrders,
  orderController.updatePaymentStatus
);

// Assign staff to order
router.patch('/:id/assign-staff', ...canManageOrders, orderController.assignStaff);

// Cancel order
router.patch('/:id/cancel', ...canManageOrders, orderController.cancelOrder);

export default router;
