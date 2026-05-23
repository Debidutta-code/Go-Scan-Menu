import { Router } from 'express';
import { MenuItemController } from './controllers/menu-item.controller';

const router = Router();
const menuItemController = new MenuItemController();

router.post('/', menuItemController.createMenuItem);
router.get('/', menuItemController.getMenuItems);
router.get('/:id', menuItemController.getMenuItem);
router.patch('/:id', menuItemController.updateMenuItem);
router.delete('/:id', menuItemController.deleteMenuItem);

export default router;
