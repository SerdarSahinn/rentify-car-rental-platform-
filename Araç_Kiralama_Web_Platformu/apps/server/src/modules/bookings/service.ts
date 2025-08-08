  import { PrismaClient } from '@prisma/client';
import { CreateBookingDto, UpdateBookingDto } from './dto';

const prisma = new PrismaClient();

export class BookingService {
  // Tüm rezervasyonları getir
  async getAllBookings() {
    return await prisma.booking.findMany({
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
  }

  // ID'ye göre rezervasyon getir
  async getBookingById(id: string) {
    return await prisma.booking.findUnique({
      where: { id },
      include: {
        vehicle: true,
      },
    });
  }

  // Tüm rezervasyonları getir (kullanıcı olmadan)
  async getAllBookingsForUser() {
    return await prisma.booking.findMany({
      include: {
        vehicle: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  // Kullanıcı email'ini güncelle
  async updateUserEmail(userId: string, newEmail: string) {
    console.log('🔍 Service: updateUserEmail called with:', { userId, newEmail });
    
    try {
      // Önce bu email'e sahip başka kullanıcı var mı kontrol et
      const existingUser = await prisma.user.findUnique({
        where: { email: newEmail },
        select: { id: true, email: true }
      });
      
      if (existingUser && existingUser.id !== userId) {
        console.log('🔍 Service: Email already exists for another user:', existingUser.email);
        
        // Eğer başka kullanıcıda varsa, o kullanıcıyı sil ve booking'lerini bu kullanıcıya taşı
        console.log('🔍 Service: Transferring bookings from existing user to current user');
        
        // Booking'leri taşı
        await prisma.booking.updateMany({
          where: { userId: existingUser.id },
          data: { userId: userId }
        });
        
        // Eski kullanıcıyı sil
        await prisma.user.delete({
          where: { id: existingUser.id }
        });
        
        console.log('🔍 Service: Old user deleted, bookings transferred');
      }
      
      // Şimdi email'i güncelle
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { email: newEmail },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true
        }
      });
      
      console.log('🔍 Service: User email updated:', updatedUser);
      return updatedUser;
    } catch (error) {
      console.error('🔍 Service: Error updating user email:', error);
      throw error;
    }
  }

  // Yeni rezervasyon oluştur
  async createBooking(bookingData: CreateBookingDto, userId: string) {
    console.log('🔍 Service: createBooking called with:', bookingData);
    
    const startDate = new Date(bookingData.startDate);
    const endDate = new Date(bookingData.endDate);
    const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

    console.log('🔍 Service: Calculated dates:', { startDate, endDate, totalDays });

    // Araç bilgilerini al ve totalPrice hesapla
    const vehicle = await prisma.vehicle.findUnique({
      where: { id: bookingData.vehicleId }
    });

    console.log('🔍 Service: Found vehicle:', vehicle);

    if (!vehicle) {
      throw new Error('Araç bulunamadı');
    }

    // Tarih çakışması kontrolü
    const isAvailable = await this.checkVehicleAvailability(
      bookingData.vehicleId, 
      startDate, 
      endDate
    );

    console.log('🔍 Service: Vehicle availability:', isAvailable);

    if (!isAvailable) {
      throw new Error('Seçilen tarihlerde araç müsait değil. Lütfen farklı tarihler seçin.');
    }

    const totalPrice = totalDays * vehicle.dailyPrice;
    console.log('🔍 Service: Calculated totalPrice:', totalPrice);

    const booking = await prisma.booking.create({
      data: {
        userId: userId,
        vehicleId: bookingData.vehicleId,
        startDate: startDate,
        endDate: endDate,
        totalDays: totalDays,
        totalPrice: totalPrice,
        status: bookingData.status || 'PENDING',
        notes: bookingData.notes,
      },
      include: {
        vehicle: true,
        user: true,
      },
    });

    // Admin'e bildirim gönder
    await this.sendBookingNotification(booking, 'PENDING');

    return booking;
  }

  // Rezervasyon güncelle
  async updateBooking(id: string, updateData: UpdateBookingDto) {
    return await prisma.booking.update({
      where: { id },
      data: {
        ...(updateData.startDate && { startDate: new Date(updateData.startDate) }),
        ...(updateData.endDate && { endDate: new Date(updateData.endDate) }),
        ...(updateData.totalPrice && { totalPrice: updateData.totalPrice }),
        ...(updateData.status && { status: updateData.status }),
        ...(updateData.notes && { notes: updateData.notes }),
      },
      include: {
        vehicle: true,
      },
    });
  }

  // Rezervasyon sil
  async deleteBooking(id: string) {
    try {
      await prisma.booking.delete({
        where: { id },
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  // Rezervasyon durumunu güncelle
  async updateBookingStatus(id: string, status: string) {
    const booking = await prisma.booking.update({
      where: { id },
      data: { status },
      include: {
        vehicle: true,
        user: true,
      },
    });

    // Notification gönder
    await this.sendBookingNotification(booking, status);

    return booking;
  }

  // Booking notification gönder
  private async sendBookingNotification(booking: any, status: string) {
    console.log('🔍 sendBookingNotification çağrıldı:', { bookingId: booking.id, status });
    
    let title = '';
    let message = '';

    switch (status) {
      case 'PENDING':
        title = 'Yeni Kiralama Talebi';
        message = `Yeni bir kiralama talebi alındı. ${booking.vehicle.brand} ${booking.vehicle.model} aracı için ${new Date(booking.startDate).toLocaleDateString('tr-TR')} - ${new Date(booking.endDate).toLocaleDateString('tr-TR')} tarihleri arasında kiralama talebi.`;
        break;
      case 'CONFIRMED':
        title = 'Kiralama Onaylandı';
        message = `Tebrikler! ${booking.vehicle.brand} ${booking.vehicle.model} aracınızın kiralama işlemi onaylandı. ${new Date(booking.startDate).toLocaleDateString('tr-TR')} tarihinde gelip aracınızı alabilirsiniz. Lütfen gerekli belgeleri hazırlayın.`;
        break;
      case 'CANCELLED':
        title = 'Kiralama İptal Edildi';
        message = `Maalesef ${booking.vehicle.brand} ${booking.vehicle.model} aracınızın kiralama işlemi iptal edildi.`;
        break;
      case 'FORM_REQUIRED':
        title = 'Form Doldurmanız Gerekiyor';
        message = `Kiralama işleminiz için gerekli belgeleri doldurmanız gerekiyor. TC kimlik, sürücü belgesi ve diğer bilgileri içeren formu doldurun.`;
        break;
      case 'FORM_APPROVED':
        title = 'Form Onaylandı';
        message = `Tebrikler! Form bilgileriniz onaylandı. ${new Date(booking.startDate).toLocaleDateString('tr-TR')} tarihinde gelip aracınızı alabilirsiniz.`;
        break;
    }

    console.log('🔍 Notification bilgileri:', { title, message, userId: booking.userId });

    if (title && message) {
      try {
        // Kullanıcıya notification gönder
        const notification = await prisma.notification.create({
          data: {
            userId: booking.userId,
            type: 'BOOKING_STATUS',
            title: title,
            message: message,
            isRead: false,
            data: JSON.stringify({
              bookingId: booking.id,
              status: status
            })
          }
        });
        
        console.log('✅ Notification oluşturuldu:', notification.id);
      } catch (error) {
        console.error('❌ Notification oluşturma hatası:', error);
      }

      // Admin'e de notification gönder (eğer PENDING ise)
      if (status === 'PENDING') {
        try {
          const adminUser = await prisma.user.findFirst({
            where: { role: 'ADMIN' }
          });

          if (adminUser) {
            // Kullanıcı bilgilerini al
            const user = await prisma.user.findUnique({
              where: { id: booking.userId },
              select: { firstName: true, email: true }
            });

            const userName = user?.firstName || user?.email || 'Bilinmeyen Kullanıcı';
            
            await prisma.notification.create({
              data: {
                userId: adminUser.id,
                type: 'NEW_BOOKING',
                title: 'Yeni Kiralama Talebi',
                message: `${userName} kullanıcısından yeni kiralama talebi alındı. ${booking.vehicle.brand} ${booking.vehicle.model} aracı için ${new Date(booking.startDate).toLocaleDateString('tr-TR')} - ${new Date(booking.endDate).toLocaleDateString('tr-TR')} tarihleri arasında.`,
                isRead: false,
                data: JSON.stringify({
                  bookingId: booking.id,
                  userId: booking.userId,
                  vehicleId: booking.vehicleId
                })
              }
            });
            
            console.log('✅ Admin notification oluşturuldu');
          }
        } catch (error) {
          console.error('❌ Admin notification oluşturma hatası:', error);
        }
      }
    }
  }

  // Araç için rezervasyonları getir
  async getVehicleBookings(vehicleId: string) {
    return await prisma.booking.findMany({
      where: { vehicleId },
      orderBy: {
        startDate: 'asc',
      },
    });
  }

  // Belirli tarih aralığında araç müsaitlik kontrolü
  async checkVehicleAvailability(vehicleId: string, startDate: Date, endDate: Date) {
    console.log('🔍 Service: Checking availability for vehicle', vehicleId, 'from', startDate, 'to', endDate);
    
    const conflictingBookings = await prisma.booking.findMany({
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

    console.log('🔍 Service: Found conflicting bookings:', conflictingBookings);
    console.log('🔍 Service: Availability result:', conflictingBookings.length === 0);

    return conflictingBookings.length === 0;
  }
} 