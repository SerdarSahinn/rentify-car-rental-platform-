import { Response } from 'express';
import { AuthRequest } from '../../middlewares/auth';
import { BookingService } from './service';
import { CreateBookingDto, UpdateBookingDto } from './dto';

export class BookingController {
  private bookingService: BookingService;

  constructor() {
    this.bookingService = new BookingService();
  }

  // Tüm rezervasyonları getir
  async getAllBookings(req: AuthRequest, res: Response) {
    try {
      const bookings = await this.bookingService.getAllBookings();
      return res.json({
        success: true,
        data: bookings,
        message: 'Kiralamalar başarıyla getirildi'
      });
    } catch (error) {
      return res.status(500).json({ error: 'Rezervasyonlar getirilemedi' });
    }
  }

  // ID'ye göre rezervasyon getir
  async getBookingById(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const booking = await this.bookingService.getBookingById(id);
      
      if (!booking) {
        return res.status(404).json({ error: 'Rezervasyon bulunamadı' });
      }
      
      return res.json(booking);
    } catch (error) {
      return res.status(500).json({ error: 'Rezervasyon getirilemedi' });
    }
  }

  // Tüm rezervasyonları getir (kullanıcı olmadan)
  async getAllBookingsForUser(req: AuthRequest, res: Response) {
    try {
      const bookings = await this.bookingService.getAllBookingsForUser();
      return res.json({
        success: true,
        data: bookings,
        message: 'Kullanıcı kiralamaları başarıyla getirildi'
      });
    } catch (error) {
      return res.status(500).json({ error: 'Rezervasyonlar getirilemedi' });
    }
  }

  // Yeni rezervasyon oluştur
  async createBooking(req: AuthRequest, res: Response) {
    try {
      console.log('🔍 POST /api/bookings - Request received');
      console.log('🔍 Request body:', req.body);
      console.log('🔍 User from request:', req.user);
      
      const bookingData: CreateBookingDto = req.body;
      const userId = req.user?.id;
      const userEmail = req.body.userEmail || req.user?.email;
      
      console.log('🔍 User email from request:', userEmail);
      
      if (!userId) {
        return res.status(401).json({ error: 'Kullanıcı kimliği bulunamadı' });
      }
      
      // Eğer kullanıcının email'i geçici ise ve request'te gerçek email varsa güncelle
      if (userEmail && req.user?.email?.startsWith('temp_')) {
        console.log('🔍 Updating user email from temp to:', userEmail);
        await this.bookingService.updateUserEmail(userId, userEmail);
      }
      
      console.log('🔍 Creating booking with data:', {
        userId: userId,
        vehicleId: bookingData.vehicleId,
        startDate: bookingData.startDate,
        endDate: bookingData.endDate,
        notes: bookingData.notes
      });
      
      const newBooking = await this.bookingService.createBooking(bookingData, userId);
      
      console.log('🔍 Booking created successfully:', newBooking.id);
      return res.status(201).json(newBooking);
    } catch (error) {
      console.error('🔍 Booking creation error:', error);
      return res.status(400).json({ error: 'Rezervasyon oluşturulamadı' });
    }
  }

  // Rezervasyon güncelle
  async updateBooking(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const updateData: UpdateBookingDto = req.body;
      const updatedBooking = await this.bookingService.updateBooking(id, updateData);
      
      if (!updatedBooking) {
        return res.status(404).json({ error: 'Rezervasyon bulunamadı' });
      }
      
      return res.json(updatedBooking);
    } catch (error) {
      return res.status(400).json({ error: 'Rezervasyon güncellenemedi' });
    }
  }

  // Rezervasyon sil
  async deleteBooking(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const deleted = await this.bookingService.deleteBooking(id);
      
      if (!deleted) {
        return res.status(404).json({ error: 'Rezervasyon bulunamadı' });
      }
      
      return res.json({ message: 'Rezervasyon başarıyla silindi' });
    } catch (error) {
      return res.status(500).json({ error: 'Rezervasyon silinemedi' });
    }
  }

  // Rezervasyon durumunu güncelle
  async updateBookingStatus(req: AuthRequest, res: Response) {
    try {
      console.log('🔍 updateBookingStatus çağrıldı');
      const { id } = req.params;
      const { status } = req.body;
      
      console.log('🔍 Güncellenecek booking ID:', id);
      console.log('🔍 Yeni status:', status);
      
      const updatedBooking = await this.bookingService.updateBookingStatus(id, status);
      
      if (!updatedBooking) {
        console.log('❌ Booking bulunamadı');
        return res.status(404).json({ error: 'Rezervasyon bulunamadı' });
      }
      
      console.log('✅ Booking güncellendi:', updatedBooking.id);
      console.log('✅ Yeni status:', updatedBooking.status);
      
      return res.json(updatedBooking);
    } catch (error) {
      console.error('❌ updateBookingStatus hatası:', error);
      return res.status(400).json({ error: 'Rezervasyon durumu güncellenemedi' });
    }
  }

  // Araç için rezervasyonları getir
  async getVehicleBookings(req: AuthRequest, res: Response) {
    try {
      const { vehicleId } = req.params;
      const bookings = await this.bookingService.getVehicleBookings(vehicleId);
      return res.json(bookings);
    } catch (error) {
      return res.status(500).json({ error: 'Araç rezervasyonları getirilemedi' });
    }
  }
} 