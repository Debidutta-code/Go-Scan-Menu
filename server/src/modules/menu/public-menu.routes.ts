import { Router } from 'express';
import { PublicMenuController } from './controllers/public-menu.controller';

const router = Router();
const publicMenuController = new PublicMenuController();

// Public routes - no authentication required

// Get complete menu by restaurant slug
router.get('/menu/:restaurantSlug', publicMenuController.getMenuBySlug);

// Get restaurant basic info
router.get('/restaurant/:restaurantSlug', publicMenuController.getRestaurantInfo);

export default router;
