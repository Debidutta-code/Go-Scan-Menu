import { Router } from 'express';
import { PublicMenuController } from './controllers/public-menu.controller';

const router = Router();
const ctrl = new PublicMenuController();

// Lightweight category list (used by the grid/landing page)
router.get('/categories/:restaurantSlug', ctrl.getCategoriesBySlug);

// Full menu with items (used by the menu-list page)
router.get('/menu/:restaurantSlug', ctrl.getMenuBySlug);

// Basic restaurant info
router.get('/restaurant/:restaurantSlug', ctrl.getRestaurantInfo);

export default router;
