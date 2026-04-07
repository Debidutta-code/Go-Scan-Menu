import { Router } from 'express';
import { PublicMenuController } from './controllers/public-menu.controller';
import { OrderController } from '../order';

const router = Router();
const publicMenuController = new PublicMenuController();
const orderController = new OrderController();

// Public routes - no authentication required

// Get complete menu by QR code scan (restaurant + branch + table + menu)
router.get('/menu/:restaurantSlug/:branchCode/:qrCode', publicMenuController.getMenuByQrCode);

// Get menu by branch (without specific table)
router.get('/menu/:restaurantSlug/:branchCode', publicMenuController.getMenuByBranch);

// Get restaurant basic info
router.get('/restaurant/:restaurantSlug', publicMenuController.getRestaurantInfo);

// Create order (public)
router.post('/orders/:restaurantId', orderController.createOrder); // Keep for backward compatibility
router.post('/orders/:restaurantSlug/:branchCode', orderController.createPublicOrder);

// Get orders by table (public)
router.get('/orders/table/:tableId', orderController.getOrdersByTable); // Keep for backward compatibility
router.get('/orders/:restaurantSlug/:branchCode/table/:tableId', orderController.getOrdersByTable);

export default router;
