import { Router } from 'express';
import { ModifierController } from './controllers/modifier.controller';
import { AuthMiddleware } from '@/modules/staff';

const router = Router({ mergeParams: true });
const modifierController = new ModifierController();

// All routes require authentication
router.use(AuthMiddleware.authenticate);

// Options
router.post('/options', AuthMiddleware.authorizePermission('menu', 'create'), modifierController.createOption);
router.get('/options', modifierController.getOptions);
router.patch('/options/:id', AuthMiddleware.authorizePermission('menu', 'update'), modifierController.updateOption);
router.delete('/options/:id', AuthMiddleware.authorizePermission('menu', 'delete'), modifierController.deleteOption);

// Groups
router.post('/groups', AuthMiddleware.authorizePermission('menu', 'create'), modifierController.createGroup);
router.get('/groups', modifierController.getGroups);
router.get('/groups/:id', modifierController.getGroup);
router.patch('/groups/:id', AuthMiddleware.authorizePermission('menu', 'update'), modifierController.updateGroup);
router.delete('/groups/:id', AuthMiddleware.authorizePermission('menu', 'delete'), modifierController.deleteGroup);

export default router;
