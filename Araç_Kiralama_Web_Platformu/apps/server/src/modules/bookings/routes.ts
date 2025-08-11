import { Router } from 'express';
import { BookingController } from './controller';
import { authenticateUser, requireAdmin } from '../../middlewares/auth';

const router: Router = Router();
const bookingController = new BookingController();

// Tüm rezervasyonları getir (admin için)
router.get('/', authenticateUser, requireAdmin, bookingController.getAllBookings.bind(bookingController));

// Tüm rezervasyonları getir (kullanıcı için)
router.get('/user', authenticateUser, bookingController.getAllBookingsForUser.bind(bookingController));

// ID'ye göre rezervasyon getir
router.get('/:id', authenticateUser, bookingController.getBookingById.bind(bookingController));

// Araç için rezervasyonları getir
router.get('/vehicle/:vehicleId', authenticateUser, bookingController.getVehicleBookings.bind(bookingController));

// Araç takvim verisi getir - aylık müsaitlik
router.get('/calendar/:vehicleId', authenticateUser, bookingController.getVehicleCalendar.bind(bookingController));

// Belirli tarih aralığında tüm araçların müsaitlik durumu
router.get('/availability', authenticateUser, bookingController.getVehiclesAvailability.bind(bookingController));

// Yeni rezervasyon oluştur
router.post('/', authenticateUser, bookingController.createBooking.bind(bookingController));

// Rezervasyon güncelle
router.put('/:id', authenticateUser, bookingController.updateBooking.bind(bookingController));

// Rezervasyon durumunu güncelle (sadece admin)
router.patch('/:id/status', authenticateUser, requireAdmin, bookingController.updateBookingStatus.bind(bookingController));

// Rezervasyon sil (sadece admin)
router.delete('/:id', authenticateUser, requireAdmin, bookingController.deleteBooking.bind(bookingController));

export default router; 