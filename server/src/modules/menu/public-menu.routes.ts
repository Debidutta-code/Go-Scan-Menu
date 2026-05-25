import { Router } from 'express';
import { PublicMenuController } from './controllers/public-menu.controller';

const router = Router();
const publicMenuController = new PublicMenuController();

// Public routes - no authentication required

// Get initial public data (restaurant and table info)
// Explicitly define both routes to ensure matching with and without QR code
router.get('/init/:restaurantSlug/:qrCode', publicMenuController.getInitData);
router.get('/init/:restaurantSlug', publicMenuController.getInitData);

// Get categories list
router.get('/categories/:restaurantSlug', publicMenuController.getCategories);

// Get full menu (categories with items)
router.get('/menu/:restaurantSlug', publicMenuController.getMenu);

// --- Deprecated routes ---
// Get complete menu by QR code scan (restaurant + table + menu)
router.get('/menu/:restaurantSlug/:qrCode', publicMenuController.getMenuByQrCode);

// Get restaurant basic info
router.get('/restaurant/:restaurantSlug', publicMenuController.getRestaurantInfo);

export default router;
