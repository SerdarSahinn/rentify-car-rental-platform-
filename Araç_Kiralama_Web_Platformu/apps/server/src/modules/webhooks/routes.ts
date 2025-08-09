import { Router } from 'express';
import { handleClerkWebhook } from './clerk';

const router = Router();

// Clerk webhook endpoint
router.post('/clerk', handleClerkWebhook);

export default router;
