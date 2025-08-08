const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkBookings() {
  try {
    console.log('🔍 Booking\'ler kontrol ediliyor...');
    
    // Tüm booking'leri al
    const bookings = await prisma.booking.findMany({
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
            model: true,
            year: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log(`📋 Toplam ${bookings.length} booking bulundu\n`);

    if (bookings.length === 0) {
      console.log('❌ Hiç booking bulunamadı!');
      return;
    }

    // Her booking'i detaylı göster
    bookings.forEach((booking, index) => {
      console.log(`🚗 Booking ${index + 1}:`);
      console.log(`   ID: ${booking.id}`);
      console.log(`   Araç: ${booking.vehicle?.brand} ${booking.vehicle?.model} (${booking.vehicle?.year})`);
      console.log(`   Tarih: ${new Date(booking.startDate).toLocaleDateString('tr-TR')} - ${new Date(booking.endDate).toLocaleDateString('tr-TR')}`);
      console.log(`   Gün: ${booking.totalDays}`);
      console.log(`   Ücret: ₺${booking.totalPrice}`);
      console.log(`   Durum: ${booking.status}`);
      console.log(`   Kullanıcı: ${booking.user?.email || 'Kullanıcı yok'} (${booking.user?.firstName || 'Ad yok'} ${booking.user?.lastName || 'Soyad yok'})`);
      console.log(`   Not: ${booking.notes || 'Not yok'}`);
      console.log('');
    });

    // Kullanıcı istatistikleri
    const userStats = {};
    bookings.forEach(booking => {
      const userEmail = booking.user?.email || 'Bilinmeyen';
      userStats[userEmail] = (userStats[userEmail] || 0) + 1;
    });

    console.log('📊 Kullanıcı İstatistikleri:');
    Object.entries(userStats).forEach(([email, count]) => {
      console.log(`   ${email}: ${count} kiralama`);
    });

  } catch (error) {
    console.error('❌ Hata:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkBookings();
