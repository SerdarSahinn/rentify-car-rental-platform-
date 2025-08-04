import { Router } from 'express';
import {
  getProfile,
  updateProfile,
  clerkWebhook,
  getUserStats,
} from './controller';
import { authenticateUser } from '../../middlewares/auth';

const router = Router();

// Protected routes
router.get('/profile', authenticateUser, getProfile);
router.put('/profile', authenticateUser, updateProfile);
router.get('/stats', authenticateUser, getUserStats);

// Webhook (public)
router.post('/webhook', clerkWebhook);

export default router; 