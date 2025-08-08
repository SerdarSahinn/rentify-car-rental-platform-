import { Router } from 'express';
import { NotificationController } from './controller';
import { authenticateUser } from '../../middlewares/auth';

const router: Router = Router();
const notificationController = new NotificationController();

// Kullanıcının bildirimlerini getir
router.get('/user', authenticateUser, notificationController.getUserNotifications.bind(notificationController));
router.post('/user', authenticateUser, notificationController.getUserNotifications.bind(notificationController));

// Bildirimi okundu olarak işaretle
router.patch('/:notificationId/read', authenticateUser, notificationController.markAsRead.bind(notificationController));

// Tüm bildirimleri okundu olarak işaretle
router.patch('/read-all', authenticateUser, notificationController.markAllAsRead.bind(notificationController));

export default router;
