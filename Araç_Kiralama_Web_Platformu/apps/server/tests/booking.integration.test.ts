import request from 'supertest';
import express from 'express';
import bookingRoutes from '../src/modules/bookings/routes';

// Express app oluştur
const app = express();
app.use(express.json());
app.use('/api/bookings', bookingRoutes);

// Mock auth middleware
jest.mock('../src/middlewares/auth', () => ({
  authenticateUser: (req: any, res: any, next: any) => {
    req.user = {
      id: 'test-user-123',
      email: 'test@example.com',
      role: 'USER'
    };
    next();
  },
  requireAdmin: (req: any, res: any, next: any) => {
    if (req.user?.email === 'admin@rentify.com') {
      next();
    } else {
      res.status(403).json({ error: 'Admin yetkisi gerekli' });
    }
  }
}));

// Mock BookingService
jest.mock('../src/modules/bookings/service', () => ({
  BookingService: jest.fn().mockImplementation(() => ({
    getAllBookings: jest.fn().mockResolvedValue([
      {
        id: 'booking-123',
        status: 'PENDING',
        vehicle: { brand: 'BMW', model: 'X5' },
        user: { firstName: 'John', email: 'john@test.com' }
      }
    ]),
    getBookingById: jest.fn().mockResolvedValue({
      id: 'booking-123',
      status: 'CONFIRMED',
      vehicle: { brand: 'Mercedes', model: 'C200' }
    }),
    createBooking: jest.fn().mockResolvedValue({
      id: 'new-booking-123',
      vehicleId: 'vehicle-123',
      status: 'PENDING',
      totalPrice: 2500
    }),
    updateBookingStatus: jest.fn().mockResolvedValue({
      id: 'booking-123',
      status: 'CONFIRMED'
    }),
    deleteBooking: jest.fn().mockResolvedValue(true)
  }))
}));

describe('Booking API Integration Tests', () => {
  describe('GET /api/bookings', () => {
    it('tüm rezervasyonları getirmeli', async () => {
      const response = await request(app)
        .get('/api/bookings')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0]).toHaveProperty('id', 'booking-123');
    });
  });

  describe('GET /api/bookings/:id', () => {
    it('ID ile rezervasyon getirmeli', async () => {
      const response = await request(app)
        .get('/api/bookings/booking-123')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id', 'booking-123');
      expect(response.body.data).toHaveProperty('status', 'CONFIRMED');
    });
  });

  describe('POST /api/bookings', () => {
    it('yeni rezervasyon oluşturmalı', async () => {
      const bookingData = {
        vehicleId: 'vehicle-123',
        startDate: '2025-01-10',
        endDate: '2025-01-15',
        notes: 'Test booking'
      };

      const response = await request(app)
        .post('/api/bookings')
        .send(bookingData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id', 'new-booking-123');
      expect(response.body.data).toHaveProperty('status', 'PENDING');
    });

    it('geçersiz veri ile 400 dönmeli', async () => {
      const invalidData = {
        // vehicleId eksik
        startDate: '2025-01-10',
        endDate: '2025-01-15'
      };

      await request(app)
        .post('/api/bookings')
        .send(invalidData)
        .expect(400);
    });
  });

  describe('PUT /api/bookings/:id/status', () => {
    it('rezervasyon durumunu güncellemeli', async () => {
      const response = await request(app)
        .put('/api/bookings/booking-123/status')
        .send({ status: 'CONFIRMED' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('status', 'CONFIRMED');
    });
  });

  describe('DELETE /api/bookings/:id', () => {
    it('rezervasyonu silmeli', async () => {
      const response = await request(app)
        .delete('/api/bookings/booking-123')
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });
});
