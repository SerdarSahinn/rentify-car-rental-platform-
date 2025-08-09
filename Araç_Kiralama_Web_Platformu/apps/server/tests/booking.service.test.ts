import { BookingService } from '../src/modules/bookings/service';
import { PrismaClient } from '@prisma/client';

// Test için mock Prisma
const mockPrisma = {
  booking: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    updateMany: jest.fn(),
  },
  vehicle: {
    findUnique: jest.fn(),
  },
  user: {
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  notification: {
    create: jest.fn(),
  },
} as any;

// BookingService'i mock Prisma ile patch et
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn(() => mockPrisma),
}));

describe('BookingService', () => {
  let bookingService: BookingService;

  beforeEach(() => {
    bookingService = new BookingService();
    jest.clearAllMocks();
  });

  describe('getAllBookings', () => {
    it('tüm rezervasyonları getirmeli', async () => {
      // Arrange
      const mockBookings = [
        {
          id: '1',
          status: 'PENDING',
          vehicle: { brand: 'BMW', model: 'X5' },
          user: { firstName: 'John', email: 'john@test.com' }
        }
      ];
      mockPrisma.booking.findMany.mockResolvedValue(mockBookings);

      // Act
      const result = await bookingService.getAllBookings();

      // Assert
      expect(result).toEqual(mockBookings);
      expect(mockPrisma.booking.findMany).toHaveBeenCalledWith({
        include: {
          vehicle: true,
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              phone: true,
            }
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    });
  });

  describe('getBookingById', () => {
    it('ID ile rezervasyon getirmeli', async () => {
      // Arrange
      const bookingId = 'test-booking-id';
      const mockBooking = {
        id: bookingId,
        status: 'CONFIRMED',
        vehicle: { brand: 'Mercedes', model: 'C200' }
      };
      mockPrisma.booking.findUnique.mockResolvedValue(mockBooking);

      // Act
      const result = await bookingService.getBookingById(bookingId);

      // Assert
      expect(result).toEqual(mockBooking);
      expect(mockPrisma.booking.findUnique).toHaveBeenCalledWith({
        where: { id: bookingId },
        include: {
          vehicle: true,
        },
      });
    });
  });

  describe('checkVehicleAvailability', () => {
    it('araç müsait olduğunda true dönmeli', async () => {
      // Arrange
      const vehicleId = 'vehicle-123';
      const startDate = new Date('2025-01-10');
      const endDate = new Date('2025-01-15');
      
      mockPrisma.booking.findMany.mockResolvedValue([]); // Çakışan booking yok

      // Act
      const result = await bookingService.checkVehicleAvailability(vehicleId, startDate, endDate);

      // Assert
      expect(result).toBe(true);
      expect(mockPrisma.booking.findMany).toHaveBeenCalledWith({
        where: {
          vehicleId,
          AND: [
            {
              startDate: { lte: endDate },
              endDate: { gte: startDate },
            },
          ],
          status: {
            in: ['CONFIRMED', 'PENDING'],
          },
        },
      });
    });

    it('araç müsait olmadığında false dönmeli', async () => {
      // Arrange
      const vehicleId = 'vehicle-123';
      const startDate = new Date('2025-01-10');
      const endDate = new Date('2025-01-15');
      
      const conflictingBooking = {
        id: 'conflict-booking',
        startDate: new Date('2025-01-12'),
        endDate: new Date('2025-01-14'),
        status: 'CONFIRMED'
      };
      mockPrisma.booking.findMany.mockResolvedValue([conflictingBooking]);

      // Act
      const result = await bookingService.checkVehicleAvailability(vehicleId, startDate, endDate);

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('createBooking', () => {
    it('yeni rezervasyon oluşturmalı', async () => {
      // Arrange
      const bookingData = {
        vehicleId: 'vehicle-123',
        startDate: '2025-01-10',
        endDate: '2025-01-15',
        status: 'PENDING' as const,
        notes: 'Test booking'
      };
      const userId = 'user-123';
      
      const mockVehicle = {
        id: 'vehicle-123',
        brand: 'BMW',
        model: 'X5',
        dailyPrice: 500
      };

      const mockCreatedBooking = {
        id: 'new-booking-123',
        ...bookingData,
        totalDays: 5,
        totalPrice: 2500,
        vehicle: mockVehicle,
        user: { id: userId }
      };

      mockPrisma.vehicle.findUnique.mockResolvedValue(mockVehicle);
      mockPrisma.booking.findMany.mockResolvedValue([]); // Vehicle available
      mockPrisma.booking.create.mockResolvedValue(mockCreatedBooking);
      mockPrisma.user.findFirst.mockResolvedValue({ id: 'admin-123', role: 'ADMIN' });
      mockPrisma.user.findUnique.mockResolvedValue({ firstName: 'John', email: 'john@test.com' });
      mockPrisma.notification.create.mockResolvedValue({ id: 'notification-123' });

      // Act
      const result = await bookingService.createBooking(bookingData, userId);

      // Assert
      expect(result).toEqual(mockCreatedBooking);
      expect(mockPrisma.vehicle.findUnique).toHaveBeenCalledWith({
        where: { id: bookingData.vehicleId }
      });
      expect(mockPrisma.booking.create).toHaveBeenCalledWith({
        data: {
          userId: userId,
          vehicleId: bookingData.vehicleId,
          startDate: new Date(bookingData.startDate),
          endDate: new Date(bookingData.endDate),
          totalDays: 5,
          totalPrice: 2500,
          status: 'PENDING',
          notes: bookingData.notes,
        },
        include: {
          vehicle: true,
          user: true,
        },
      });
    });

    it('araç bulunamadığında hata fırlatmalı', async () => {
      // Arrange
      const bookingData = {
        vehicleId: 'nonexistent-vehicle',
        startDate: '2025-01-10',
        endDate: '2025-01-15',
      };
      const userId = 'user-123';

      mockPrisma.vehicle.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(
        bookingService.createBooking(bookingData, userId)
      ).rejects.toThrow('Araç bulunamadı');
    });

    it('araç müsait olmadığında hata fırlatmalı', async () => {
      // Arrange
      const bookingData = {
        vehicleId: 'vehicle-123',
        startDate: '2025-01-10',
        endDate: '2025-01-15',
      };
      const userId = 'user-123';

      const mockVehicle = {
        id: 'vehicle-123',
        dailyPrice: 500
      };

      mockPrisma.vehicle.findUnique.mockResolvedValue(mockVehicle);
      mockPrisma.booking.findMany.mockResolvedValue([{ id: 'conflict' }]); // Vehicle not available

      // Act & Assert
      await expect(
        bookingService.createBooking(bookingData, userId)
      ).rejects.toThrow('Seçilen tarihlerde araç müsait değil');
    });
  });

  describe('updateBookingStatus', () => {
    it('rezervasyon durumunu güncellemeli', async () => {
      // Arrange
      const bookingId = 'booking-123';
      const newStatus = 'CONFIRMED';
      
      const mockUpdatedBooking = {
        id: bookingId,
        status: newStatus,
        vehicle: { brand: 'BMW', model: 'X5' },
        user: { id: 'user-123' }
      };

      mockPrisma.booking.update.mockResolvedValue(mockUpdatedBooking);
      mockPrisma.notification.create.mockResolvedValue({ id: 'notification-123' });

      // Act
      const result = await bookingService.updateBookingStatus(bookingId, newStatus);

      // Assert
      expect(result).toEqual(mockUpdatedBooking);
      expect(mockPrisma.booking.update).toHaveBeenCalledWith({
        where: { id: bookingId },
        data: { status: newStatus },
        include: {
          vehicle: true,
          user: true,
        },
      });
    });
  });

  describe('deleteBooking', () => {
    it('rezervasyonu silmeli ve true dönmeli', async () => {
      // Arrange
      const bookingId = 'booking-123';
      mockPrisma.booking.delete.mockResolvedValue({ id: bookingId });

      // Act
      const result = await bookingService.deleteBooking(bookingId);

      // Assert
      expect(result).toBe(true);
      expect(mockPrisma.booking.delete).toHaveBeenCalledWith({
        where: { id: bookingId },
      });
    });

    it('silme işlemi başarısız olursa false dönmeli', async () => {
      // Arrange
      const bookingId = 'booking-123';
      mockPrisma.booking.delete.mockRejectedValue(new Error('Delete failed'));

      // Act
      const result = await bookingService.deleteBooking(bookingId);

      // Assert
      expect(result).toBe(false);
    });
  });
});
