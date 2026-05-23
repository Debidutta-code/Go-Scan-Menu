import { Router } from 'express';
import { RestaurantController } from './controllers/restaurant.controller';

const router = Router();
const restaurantController = new RestaurantController();

router.get('/:id', restaurantController.getRestaurant);
router.patch('/:id', restaurantController.updateRestaurant);

export default router;
