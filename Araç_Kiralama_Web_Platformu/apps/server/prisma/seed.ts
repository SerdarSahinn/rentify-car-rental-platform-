import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seed data oluşturuluyor...');

  // Test kullanıcısı oluştur
  const testUser = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      clerkId: 'test_clerk_id',
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      role: 'USER',
    },
  });

  // Admin kullanıcısı oluştur
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      clerkId: 'admin_clerk_id',
      email: 'admin@example.com',
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN',
    },
  });

  // Test araçları oluştur
  const vehicles = [
    {
      brand: 'Toyota',
      model: 'Corolla',
      year: 2022,
      fuelType: 'GASOLINE',
      transmission: 'AUTOMATIC',
      category: 'COMPACT',
      seats: 5,
      dailyPrice: 150.0,
      weeklyPrice: 900.0,
      monthlyPrice: 3000.0,
      description: 'Güvenilir ve ekonomik Toyota Corolla. Şehir içi kullanım için ideal.',
      features: JSON.stringify(['AC', 'GPS', 'Bluetooth', 'Backup Camera']),
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800',
        'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800',
      ]),
      location: 'İstanbul, Türkiye',
      latitude: 41.0082,
      longitude: 28.9784,
      isAvailable: true,
      isFeatured: true,
    },
    {
      brand: 'Honda',
      model: 'Civic',
      year: 2023,
      fuelType: 'GASOLINE',
      transmission: 'AUTOMATIC',
      category: 'COMPACT',
      seats: 5,
      dailyPrice: 180.0,
      weeklyPrice: 1080.0,
      monthlyPrice: 3600.0,
      description: 'Sportif tasarım ve yüksek performans. Honda Civic ile keyifli sürüş.',
      features: JSON.stringify(['AC', 'GPS', 'Bluetooth', 'Sport Mode', 'LED Headlights']),
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800',
        'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800',
      ]),
      location: 'Ankara, Türkiye',
      latitude: 39.9334,
      longitude: 32.8597,
      isAvailable: true,
      isFeatured: false,
    },
    {
      brand: 'BMW',
      model: 'X5',
      year: 2023,
      fuelType: 'DIESEL',
      transmission: 'AUTOMATIC',
      category: 'SUV',
      seats: 7,
      dailyPrice: 400.0,
      weeklyPrice: 2400.0,
      monthlyPrice: 8000.0,
      description: 'Lüks SUV deneyimi. BMW X5 ile konfor ve performansı bir arada yaşayın.',
      features: JSON.stringify(['AC', 'GPS', 'Bluetooth', 'Leather Seats', 'Panoramic Roof', 'Premium Sound']),
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800',
        'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800',
      ]),
      location: 'İzmir, Türkiye',
      latitude: 38.4192,
      longitude: 27.1287,
      isAvailable: true,
      isFeatured: true,
    },
    {
      brand: 'Mercedes',
      model: 'C-Class',
      year: 2022,
      fuelType: 'GASOLINE',
      transmission: 'AUTOMATIC',
      category: 'LUXURY',
      seats: 5,
      dailyPrice: 350.0,
      weeklyPrice: 2100.0,
      monthlyPrice: 7000.0,
      description: 'Mercedes kalitesi ve lüks. C-Class ile prestijli sürüş deneyimi.',
      features: JSON.stringify(['AC', 'GPS', 'Bluetooth', 'Leather Seats', 'Ambient Lighting', 'Premium Audio']),
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800',
        'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800',
      ]),
      location: 'Bursa, Türkiye',
      latitude: 40.1885,
      longitude: 29.0610,
      isAvailable: true,
      isFeatured: false,
    },
    {
      brand: 'Volkswagen',
      model: 'Golf',
      year: 2021,
      fuelType: 'DIESEL',
      transmission: 'MANUAL',
      category: 'COMPACT',
      seats: 5,
      dailyPrice: 120.0,
      weeklyPrice: 720.0,
      monthlyPrice: 2400.0,
      description: 'Klasik Volkswagen Golf. Ekonomik ve güvenilir.',
      features: JSON.stringify(['AC', 'Bluetooth', 'Cruise Control']),
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800',
        'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800',
      ]),
      location: 'Antalya, Türkiye',
      latitude: 36.8969,
      longitude: 30.7133,
      isAvailable: true,
      isFeatured: false,
    },
  ];

  for (const vehicleData of vehicles) {
    await prisma.vehicle.create({
      data: vehicleData,
    });
  }

  // Test yorumları oluştur
  const reviews = [
    {
      userId: testUser.id,
      vehicleId: (await prisma.vehicle.findFirst({ where: { brand: 'Toyota' } }))!.id,
      rating: 5,
      comment: 'Harika bir araç! Çok memnun kaldım.',
      isApproved: true,
    },
    {
      userId: testUser.id,
      vehicleId: (await prisma.vehicle.findFirst({ where: { brand: 'BMW' } }))!.id,
      rating: 4,
      comment: 'Lüks ve konforlu. Tekrar kiralarım.',
      isApproved: true,
    },
  ];

  for (const reviewData of reviews) {
    await prisma.review.create({
      data: reviewData,
    });
  }

  console.log('✅ Seed data başarıyla oluşturuldu!');
  console.log(`👤 Test kullanıcısı: ${testUser.email}`);
  console.log(`👑 Admin kullanıcısı: ${adminUser.email}`);
  console.log(`🚗 ${vehicles.length} araç oluşturuldu`);
  console.log(`⭐ ${reviews.length} yorum oluşturuldu`);
}

main()
  .catch((e) => {
    console.error('❌ Seed hatası:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 