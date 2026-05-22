import { Router } from 'express';
import { FeedbackController } from './controllers/feedback.controller';
import { AuthMiddleware } from '@/modules/staff';

const router = Router({ mergeParams: true });
const feedbackController = new FeedbackController();

// Staff routes
router.get(
  '/analytics',
  AuthMiddleware.authenticate,
  feedbackController.getAnalytics
);

router.get(
  '/',
  AuthMiddleware.authenticate,
  feedbackController.getAllFeedback
);

router.patch(
  '/google-settings',
  AuthMiddleware.authenticate,
  feedbackController.updateGoogleSettings
);

// Public routes
router.post(
  '/public',
  feedbackController.createFeedback
);

router.post(
  '/public/track-redirect',
  feedbackController.incrementRedirect
);

export default router;
