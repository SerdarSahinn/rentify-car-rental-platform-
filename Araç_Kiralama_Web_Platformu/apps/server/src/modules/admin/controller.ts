import { Request, Response } from 'express';
import { prisma } from '../../config/database';
import { asyncHandler } from '../../middlewares/errorHandler';
import { AuthRequest } from '../../middlewares/auth';

// Tüm kullanıcıları getir (admin için)
export const getAllUsers = asyncHandler(async (req: AuthRequest, res: Response) => {
  // Admin kontrolü
  if (req.user?.role !== 'ADMIN') {
    return res.status(403).json({
      success: false,
      error: 'Bu işlem için admin yetkisi gerekli',
    });
  }

  const { page = 1, limit = 50, search, role } = req.query;
  
  const skip = (Number(page) - 1) * Number(limit);
  
  // Arama ve filtreleme koşulları
  const where: any = {};
  
  if (search) {
    where.OR = [
      { firstName: { contains: search as string, mode: 'insensitive' } },
      { lastName: { contains: search as string, mode: 'insensitive' } },
      { email: { contains: search as string, mode: 'insensitive' } },
    ];
  }
  
  if (role && role !== 'all') {
    where.role = role;
  }

  try {
    // Kullanıcıları getir
    const users = await prisma.user.findMany({
      where,
      skip,
      take: Number(limit),
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        clerkId: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        avatar: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            bookings: true,
            reviews: true,
            favorites: true,
          },
        },
      },
    });

    // Toplam sayı
    const totalUsers = await prisma.user.count({ where });
    
    // Son giriş bilgilerini simüle et (gerçek uygulamada tracking tablosu olur)
    const usersWithLastLogin = users.map(user => ({
      ...user,
      totalBookings: user._count.bookings,
      lastLogin: user.updatedAt, // Son güncelleme zamanını son giriş olarak kullan
    }));

    // İstatistikler
    const stats = {
      total: totalUsers,
      active: await prisma.user.count({ where: { ...where, isActive: true } }),
      inactive: await prisma.user.count({ where: { ...where, isActive: false } }),
      admins: await prisma.user.count({ where: { ...where, role: 'ADMIN' } }),
      users: await prisma.user.count({ where: { ...where, role: 'USER' } }),
    };

    return res.status(200).json({
      success: true,
      data: {
        users: usersWithLastLogin,
        pagination: {
          currentPage: Number(page),
          totalPages: Math.ceil(totalUsers / Number(limit)),
          totalItems: totalUsers,
          hasNext: skip + Number(limit) < totalUsers,
          hasPrev: Number(page) > 1,
        },
        stats,
      },
    });
  } catch (error) {
    console.error('getAllUsers error:', error);
    return res.status(500).json({
      success: false,
      error: 'Kullanıcılar getirilemedi',
    });
  }
});

// Tüm rezervasyonları getir (admin için)
export const getAllBookings = asyncHandler(async (req: AuthRequest, res: Response) => {
  // Admin kontrolü
  if (req.user?.role !== 'ADMIN') {
    return res.status(403).json({
      success: false,
      error: 'Bu işlem için admin yetkisi gerekli',
    });
  }

  const { page = 1, limit = 50, search, status } = req.query;
  
  const skip = (Number(page) - 1) * Number(limit);
  
  // Arama ve filtreleme koşulları
  const where: any = {};
  
  if (search) {
    where.OR = [
      { bookingNumber: { contains: search as string, mode: 'insensitive' } },
      { user: {
        OR: [
          { firstName: { contains: search as string, mode: 'insensitive' } },
          { lastName: { contains: search as string, mode: 'insensitive' } },
          { email: { contains: search as string, mode: 'insensitive' } },
        ]
      }},
      { vehicle: {
        OR: [
          { brand: { contains: search as string, mode: 'insensitive' } },
          { model: { contains: search as string, mode: 'insensitive' } },
        ]
      }},
    ];
  }
  
  if (status && status !== 'all') {
    where.status = status;
  }

  try {
    // Rezervasyonları getir
    const bookings = await prisma.booking.findMany({
      where,
      skip,
      take: Number(limit),
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            avatar: true,
          },
        },
        vehicle: {
          select: {
            id: true,
            brand: true,
            model: true,
            year: true,
            images: true,
            dailyPrice: true,
          },
        },
      },
    });

    // Toplam sayı
    const totalBookings = await prisma.booking.count({ where });
    
    // Rezervasyonları formatla
    const formattedBookings = bookings.map(booking => {
      // Images JSON string'ini parse et
      let vehicleImages: string[] = [];
      try {
        vehicleImages = JSON.parse(booking.vehicle.images || '[]');
      } catch {
        vehicleImages = [];
      }

      return {
        id: booking.id,
        bookingNumber: `RNT-${new Date(booking.createdAt).getFullYear()}-${booking.id.slice(-3).toUpperCase()}`,
        user: {
          name: `${booking.user.firstName || ''} ${booking.user.lastName || ''}`.trim(),
          email: booking.user.email,
          phone: booking.user.phone,
          avatar: booking.user.avatar,
        },
        vehicle: {
          brand: booking.vehicle.brand,
          model: booking.vehicle.model,
          year: booking.vehicle.year,
          image: vehicleImages[0] || 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=300',
          pricePerDay: booking.vehicle.dailyPrice,
        },
        startDate: booking.startDate,
        endDate: booking.endDate,
        totalDays: booking.totalDays,
        totalPrice: booking.totalPrice,
        status: booking.status,
        paymentStatus: booking.paymentStatus,
        paymentMethod: null, // Schema'da yok, null olarak ayarla
        pickupLocation: booking.notes, // Notes'u pickupLocation olarak kullan
        notes: booking.notes,
        createdAt: booking.createdAt,
      };
    });

    // İstatistikler
    const stats = {
      total: totalBookings,
      pending: await prisma.booking.count({ where: { ...where, status: 'PENDING' } }),
      confirmed: await prisma.booking.count({ where: { ...where, status: 'CONFIRMED' } }),
      active: await prisma.booking.count({ where: { ...where, status: 'ACTIVE' } }),
      completed: await prisma.booking.count({ where: { ...where, status: 'COMPLETED' } }),
      cancelled: await prisma.booking.count({ where: { ...where, status: 'CANCELLED' } }),
      totalRevenue: await prisma.booking.aggregate({
        where: { 
          ...where, 
          paymentStatus: 'PAID'
        },
        _sum: { totalPrice: true }
      }).then(result => result._sum.totalPrice || 0),
    };

    return res.status(200).json({
      success: true,
      data: {
        bookings: formattedBookings,
        pagination: {
          currentPage: Number(page),
          totalPages: Math.ceil(totalBookings / Number(limit)),
          totalItems: totalBookings,
          hasNext: skip + Number(limit) < totalBookings,
          hasPrev: Number(page) > 1,
        },
        stats,
      },
    });
  } catch (error) {
    console.error('getAllBookings error:', error);
    return res.status(500).json({
      success: false,
      error: 'Rezervasyonlar getirilemedi',
    });
  }
});

// Rezervasyon durumunu güncelle
export const updateBookingStatus = asyncHandler(async (req: AuthRequest, res: Response) => {
  // Admin kontrolü
  if (req.user?.role !== 'ADMIN') {
    return res.status(403).json({
      success: false,
      error: 'Bu işlem için admin yetkisi gerekli',
    });
  }

  const { bookingId } = req.params;
  const { status } = req.body;

  const validStatuses = ['PENDING', 'CONFIRMED', 'ACTIVE', 'COMPLETED', 'CANCELLED'];
  
  if (!validStatuses.includes(status)) {
    return res.status(400).json({
      success: false,
      error: 'Geçersiz rezervasyon durumu',
    });
  }

  try {
    const booking = await prisma.booking.update({
      where: { id: bookingId },
      data: { status },
      include: {
        user: true,
        vehicle: true,
      },
    });

    return res.status(200).json({
      success: true,
      data: booking,
      message: 'Rezervasyon durumu güncellendi',
    });
  } catch (error) {
    console.error('updateBookingStatus error:', error);
    return res.status(500).json({
      success: false,
      error: 'Rezervasyon durumu güncellenemedi',
    });
  }
});

// Admin dashboard istatistikleri
export const getDashboardStats = asyncHandler(async (req: AuthRequest, res: Response) => {
  // Admin kontrolü
  if (req.user?.role !== 'ADMIN') {
    return res.status(403).json({
      success: false,
      error: 'Bu işlem için admin yetkisi gerekli',
    });
  }

  try {
    const [
      totalUsers,
      activeUsers,
      totalBookings,
      totalVehicles,
      pendingBookings,
      confirmedBookings,
      totalRevenue,
      monthlyRevenue,
    ] = await Promise.all([
      prisma.user.count({ where: { role: 'USER' } }),
      prisma.user.count({ where: { role: 'USER', isActive: true } }),
      prisma.booking.count(),
      prisma.vehicle.count(),
      prisma.booking.count({ where: { status: 'PENDING' } }),
      prisma.booking.count({ where: { status: 'CONFIRMED' } }),
      prisma.booking.aggregate({
        where: { paymentStatus: 'PAID' },
        _sum: { totalPrice: true }
      }).then(result => result._sum?.totalPrice || 0),
      prisma.booking.aggregate({
        where: { 
          paymentStatus: 'PAID',
          createdAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
          }
        },
        _sum: { totalPrice: true }
      }).then(result => result._sum?.totalPrice || 0),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        users: {
          total: totalUsers,
          active: activeUsers,
          growth: 0, // Bu hesaplanabilir
        },
        bookings: {
          total: totalBookings,
          pending: pendingBookings,
          confirmed: confirmedBookings,
          growth: 0, // Bu hesaplanabilir
        },
        vehicles: {
          total: totalVehicles,
          available: totalVehicles, // Bu hesaplanabilir
        },
        revenue: {
          total: totalRevenue,
          monthly: monthlyRevenue,
          growth: 0, // Bu hesaplanabilir
        },
      },
    });
  } catch (error) {
    console.error('getDashboardStats error:', error);
    return res.status(500).json({
      success: false,
      error: 'Dashboard istatistikleri getirilemedi',
    });
  }
});
