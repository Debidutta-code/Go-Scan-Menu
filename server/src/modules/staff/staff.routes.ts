import { Router } from 'express';
import { StaffController } from './controllers/staff.controller';

const router = Router();
const staffController = new StaffController();

router.post('/', staffController.createStaff);
router.get('/:id', staffController.getStaff);
router.patch('/:id', staffController.updateStaff);
router.delete('/:id', staffController.deleteStaff);

export default router;
