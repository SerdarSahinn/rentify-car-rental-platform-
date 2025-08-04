import { Request, Response } from 'express';
import { prisma } from '../../config/database';
import { asyncHandler } from '../../middlewares/errorHandler';
import { AuthRequest } from '../../middlewares/auth';

// Tüm araçları listele
export const getAllVehicles = asyncHandler(async (req: Request, res: Response) => {
  const {
    page = 1,
    limit = 10,
    category,
    fuelType,
    transmission,
    minPrice,
    maxPrice,
    isAvailable,
    isFeatured,
    search,
  } = req.query;

  const skip = (Number(page) - 1) * Number(limit);
  
  // Filtreleme koşulları
  const where: any = {};
  
  if (category) where.category = category;
  if (fuelType) where.fuelType = fuelType;
  if (transmission) where.transmission = transmission;
  if (isAvailable !== undefined) where.isAvailable = isAvailable === 'true';
  if (isFeatured !== undefined) where.isFeatured = isFeatured === 'true';
  
  if (minPrice || maxPrice) {
    where.dailyPrice = {};
    if (minPrice) where.dailyPrice.gte = Number(minPrice);
    if (maxPrice) where.dailyPrice.lte = Number(maxPrice);
  }
  
  if (search) {
    where.OR = [
      { brand: { contains: search as string, mode: 'insensitive' } },
      { model: { contains: search as string, mode: 'insensitive' } },
      { description: { contains: search as string, mode: 'insensitive' } },
    ];
  }

  const [vehicles, total] = await Promise.all([
    prisma.vehicle.findMany({
      where,
      skip,
      take: Number(limit),
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: {
            reviews: true,
            bookings: true,
          },
        },
      },
    }),
    prisma.vehicle.count({ where }),
  ]);

  res.status(200).json({
    success: true,
    data: vehicles,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / Number(limit)),
    },
  });
});

// Tek araç detayı
export const getVehicleById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const vehicle = await prisma.vehicle.findUnique({
    where: { id },
    include: {
      reviews: {
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatar: true,
            },
          },
        },
        where: { isApproved: true },
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
      _count: {
        select: {
          reviews: true,
          bookings: true,
        },
      },
    },
  });

  if (!vehicle) {
    return res.status(404).json({
      success: false,
      error: 'Araç bulunamadı',
    });
  }

  return res.status(200).json({
    success: true,
    data: vehicle,
  });
});

// Yeni araç ekle (Admin only)
export const createVehicle = asyncHandler(async (req: AuthRequest, res: Response) => {
  const {
    brand,
    model,
    year,
    fuelType,
    transmission,
    category,
    seats,
    dailyPrice,
    weeklyPrice,
    monthlyPrice,
    description,
    features,
    images,
    location,
    latitude,
    longitude,
  } = req.body;

  const vehicle = await prisma.vehicle.create({
    data: {
      brand,
      model,
      year: Number(year),
      fuelType,
      transmission,
      category,
      seats: Number(seats),
      dailyPrice: Number(dailyPrice),
      weeklyPrice: weeklyPrice ? Number(weeklyPrice) : null,
      monthlyPrice: monthlyPrice ? Number(monthlyPrice) : null,
      description,
      features: JSON.stringify(features),
      images: JSON.stringify(images),
      location,
      latitude: latitude ? Number(latitude) : null,
      longitude: longitude ? Number(longitude) : null,
    },
  });

  return res.status(201).json({
    success: true,
    data: vehicle,
  });
});

// Araç güncelle (Admin only)
export const updateVehicle = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const updateData = req.body;

  // JSON string'e çevir
  if (updateData.features) {
    updateData.features = JSON.stringify(updateData.features);
  }
  if (updateData.images) {
    updateData.images = JSON.stringify(updateData.images);
  }

  const vehicle = await prisma.vehicle.update({
    where: { id },
    data: updateData,
  });

  return res.status(200).json({
    success: true,
    data: vehicle,
  });
});

// Araç sil (Admin only)
export const deleteVehicle = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  await prisma.vehicle.delete({
    where: { id },
  });

  return res.status(200).json({
    success: true,
    message: 'Araç başarıyla silindi',
  });
});

// Öne çıkan araçları getir
export const getFeaturedVehicles = asyncHandler(async (req: Request, res: Response) => {
  const vehicles = await prisma.vehicle.findMany({
    where: { isFeatured: true, isAvailable: true },
    take: 6,
    orderBy: { averageRating: 'desc' },
    include: {
      _count: {
        select: {
          reviews: true,
          bookings: true,
        },
      },
    },
  });

  return res.status(200).json({
    success: true,
    data: vehicles,
  });
});

// Araç kategorilerini getir
export const getVehicleCategories = asyncHandler(async (req: Request, res: Response) => {
  const categories = await prisma.vehicle.findMany({
    select: { category: true },
    distinct: ['category'],
  });

  const uniqueCategories = categories.map(cat => cat.category);

  return res.status(200).json({
    success: true,
    data: uniqueCategories,
  });
}); 