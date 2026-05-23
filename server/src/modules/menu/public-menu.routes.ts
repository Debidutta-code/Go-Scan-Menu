import { Router } from 'express';
import { PublicMenuController } from './controllers/public-menu.controller';

const router = Router();
const publicMenuController = new PublicMenuController();

// Public routes - no authentication required

// Get complete menu by QR code scan (restaurant + table + menu)
router.get('/menu/:restaurantSlug/:qrCode', publicMenuController.getMenuByQrCode);

// Get menu (without specific table)
router.get('/menu/:restaurantSlug', publicMenuController.getMenuByBranch);

// Get restaurant basic info
router.get('/restaurant/:restaurantSlug', publicMenuController.getRestaurantInfo);

export default router;
