import { Request, Response } from 'express';
import { prisma } from '../../config/database';
import { asyncHandler } from '../../middlewares/errorHandler';
import { AuthRequest } from '../../middlewares/auth';

// Kullanıcı profilini getir
export const getProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;

  const user = await prisma.user.findUnique({
    where: { id: userId },
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

  if (!user) {
    return res.status(404).json({
      success: false,
      error: 'Kullanıcı bulunamadı',
    });
  }

  return res.status(200).json({
    success: true,
    data: user,
  });
});

// Kullanıcı profilini güncelle
export const updateProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  const { firstName, lastName, phone } = req.body;

  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      firstName,
      lastName,
      phone,
    },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      phone: true,
      avatar: true,
      role: true,
    },
  });

  res.status(200).json({
    success: true,
    data: user,
  });
});

// Clerk webhook - kullanıcı senkronizasyonu
export const clerkWebhook = asyncHandler(async (req: Request, res: Response) => {
  const { type, data } = req.body;

  switch (type) {
    case 'user.created':
      await prisma.user.create({
        data: {
          clerkId: data.id,
          email: data.email_addresses[0]?.email_address,
          firstName: data.first_name,
          lastName: data.last_name,
          avatar: data.image_url,
        },
      });
      break;

    case 'user.updated':
      await prisma.user.update({
        where: { clerkId: data.id },
        data: {
          email: data.email_addresses[0]?.email_address,
          firstName: data.first_name,
          lastName: data.last_name,
          avatar: data.image_url,
        },
      });
      break;

    case 'user.deleted':
      await prisma.user.update({
        where: { clerkId: data.id },
        data: { isActive: false },
      });
      break;

    default:
      console.log('Unhandled webhook type:', type);
  }

  res.status(200).json({ success: true });
});

// Kullanıcı istatistikleri
export const getUserStats = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;

  const [totalBookings, totalReviews, totalFavorites] = await Promise.all([
    prisma.booking.count({ where: { userId } }),
    prisma.review.count({ where: { userId } }),
    prisma.favorite.count({ where: { userId } }),
  ]);

  res.status(200).json({
    success: true,
    data: {
      totalBookings,
      totalReviews,
      totalFavorites,
    },
  });
}); 