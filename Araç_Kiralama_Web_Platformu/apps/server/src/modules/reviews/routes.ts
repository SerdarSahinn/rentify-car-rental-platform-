import { Router } from 'express';
import { ReviewController } from './controller';
import { authMiddleware } from '../../middlewares/auth';

const router = Router();
const reviewController = new ReviewController();

// Public routes
router.get('/vehicle/:vehicleId', reviewController.getVehicleReviews);

// Protected routes (authenticated users)
router.post('/', authMiddleware, reviewController.createReview);

// Admin routes (admin only)
router.delete('/:reviewId', authMiddleware, reviewController.deleteReview);
router.get('/admin/all', authMiddleware, reviewController.getAllReviews);

// Reply sistemi routes
router.post('/:reviewId/replies', authMiddleware, reviewController.createReply);
router.get('/:reviewId/replies', reviewController.getRepliesForReview);
router.delete('/replies/:replyId', authMiddleware, reviewController.deleteReply);

export default router;

