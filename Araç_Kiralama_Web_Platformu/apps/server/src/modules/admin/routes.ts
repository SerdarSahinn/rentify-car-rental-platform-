import { Router } from 'express';
import { authenticateUser, requireAdmin } from '../../middlewares/auth';
import {
  getAllUsers,
  getAllBookings,
  updateBookingStatus,
  getDashboardStats,
} from './controller';

const router = Router();

// Admin middleware - tüm route'lar için admin yetkisi gerekir
router.use(authenticateUser);
router.use(requireAdmin);

// Admin dashboard istatistikleri
router.get('/dashboard/stats', getDashboardStats);

// Kullanıcı yönetimi
router.get('/users', getAllUsers);

// Rezervasyon yönetimi
router.get('/bookings', getAllBookings);
router.patch('/bookings/:bookingId/status', updateBookingStatus);

export default router;
