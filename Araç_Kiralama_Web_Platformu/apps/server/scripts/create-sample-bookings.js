const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createSampleBookings() {
  try {
    console.log('🔍 Örnek booking\'ler oluşturuluyor...');
    
    // Önce gerçek kullanıcılar oluştur
    const realUsers = [
      {
        email: 'ahmet.yilmaz@gmail.com',
        firstName: 'Ahmet',
        lastName: 'Yılmaz',
        clerkId: 'user_ahmet_123',
        role: 'USER',
        isActive: true
      },
      {
        email: 'ayse.demir@hotmail.com',
        firstName: 'Ayşe',
        lastName: 'Demir',
        clerkId: 'user_ayse_456',
        role: 'USER',
        isActive: true
      },
      {
        email: 'mehmet.kaya@yahoo.com',
        firstName: 'Mehmet',
        lastName: 'Kaya',
        clerkId: 'user_mehmet_789',
        role: 'USER',
        isActive: true
      },
      {
        email: 'fatma.ozturk@gmail.com',
        firstName: 'Fatma',
        lastName: 'Öztürk',
        clerkId: 'user_fatma_101',
        role: 'USER',
        isActive: true
      },
      {
        email: 'ali.celik@outlook.com',
        firstName: 'Ali',
        lastName: 'Çelik',
        clerkId: 'user_ali_202',
        role: 'USER',
        isActive: true
      }
    ];

    // Kullanıcıları oluştur
    const createdUsers = [];
    for (const userData of realUsers) {
      let user = await prisma.user.findFirst({
        where: { email: userData.email }
      });
      
      if (!user) {
        user = await prisma.user.create({
          data: userData
        });
        console.log(`✅ Kullanıcı oluşturuldu: ${user.email}`);
      }
      
      createdUsers.push(user);
    }

    // Araçları al
    const vehicles = await prisma.vehicle.findMany();
    console.log(`🚗 ${vehicles.length} araç bulundu`);

    if (vehicles.length === 0) {
      console.log('❌ Araç bulunamadı!');
      return;
    }

    // Örnek booking'ler oluştur
    const sampleBookings = [
      {
        startDate: '2025-02-15',
        endDate: '2025-02-18',
        totalDays: 3,
        totalPrice: 1050,
        status: 'PENDING',
        notes: 'İş seyahati için'
      },
      {
        startDate: '2025-02-20',
        endDate: '2025-02-25',
        totalDays: 5,
        totalPrice: 1750,
        status: 'CONFIRMED',
        notes: 'Tatil için'
      },
      {
        startDate: '2025-02-28',
        endDate: '2025-03-02',
        totalDays: 2,
        totalPrice: 700,
        status: 'FORM_REQUIRED',
        notes: 'Hafta sonu gezisi'
      },
      {
        startDate: '2025-03-05',
        endDate: '2025-03-10',
        totalDays: 5,
        totalPrice: 1750,
        status: 'PENDING',
        notes: 'Aile gezisi'
      },
      {
        startDate: '2025-03-15',
        endDate: '2025-03-17',
        totalDays: 2,
        totalPrice: 700,
        status: 'CANCELLED',
        notes: 'İptal edildi'
      },
      {
        startDate: '2025-03-20',
        endDate: '2025-03-25',
        totalDays: 5,
        totalPrice: 1750,
        status: 'PENDING',
        notes: 'İş toplantısı'
      },
      {
        startDate: '2025-03-28',
        endDate: '2025-04-02',
        totalDays: 5,
        totalPrice: 1750,
        status: 'FORM_PENDING',
        notes: 'Şehirler arası seyahat'
      },
      {
        startDate: '2025-04-05',
        endDate: '2025-04-08',
        totalDays: 3,
        totalPrice: 1050,
        status: 'CONFIRMED',
        notes: 'Doğum günü kutlaması'
      }
    ];

    console.log('\n📋 Booking\'ler oluşturuluyor...');
    
    for (let i = 0; i < sampleBookings.length; i++) {
      const bookingData = sampleBookings[i];
      const user = createdUsers[i % createdUsers.length];
      const vehicle = vehicles[i % vehicles.length];

      const booking = await prisma.booking.create({
        data: {
          userId: user.id,
          vehicleId: vehicle.id,
          startDate: new Date(bookingData.startDate),
          endDate: new Date(bookingData.endDate),
          totalDays: bookingData.totalDays,
          totalPrice: bookingData.totalPrice,
          status: bookingData.status,
          notes: bookingData.notes
        }
      });

      console.log(`✅ Booking oluşturuldu: ${user.email} → ${vehicle.brand} ${vehicle.model} (${bookingData.status})`);
    }

    // Son durumu kontrol et
    const finalBookings = await prisma.booking.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true
          }
        },
        vehicle: {
          select: {
            id: true,
            brand: true,
            model: true
          }
        }
      }
    });

    console.log('\n🎉 Final durum:');
    finalBookings.forEach((booking, index) => {
      console.log(`${index + 1}. ${booking.user?.email} (${booking.user?.firstName} ${booking.user?.lastName}) → ${booking.vehicle?.brand} ${booking.vehicle?.model} - ${booking.status}`);
    });

  } catch (error) {
    console.error('❌ Hata:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createSampleBookings();
