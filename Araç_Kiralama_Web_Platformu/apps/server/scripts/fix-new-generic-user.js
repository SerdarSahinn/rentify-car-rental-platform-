const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixNewGenericUser() {
  try {
    console.log('🔧 Yeni generic kullanıcıyı düzeltiyorum...');
    
    // Toyota Corolla booking'ini bul
    const booking = await prisma.booking.findFirst({
      where: {
        vehicle: {
          brand: 'Toyota',
          model: 'Corolla'
        }
      },
      include: {
        user: true,
        vehicle: true
      }
    });

    if (!booking) {
      console.log('❌ Toyota Corolla booking bulunamadı!');
      return;
    }

    console.log(`✅ Booking bulundu: ${booking.vehicle.brand} ${booking.vehicle.model}`);
    console.log(`   Mevcut kullanıcı: ${booking.user?.email}`);
    console.log(`   Tarih: ${new Date(booking.startDate).toLocaleDateString('tr-TR')} - ${new Date(booking.endDate).toLocaleDateString('tr-TR')}`);

    // Bu generic kullanıcıyı sil
    if (booking.user && booking.user.email.includes('user_user_')) {
      console.log(`🗑️ Generic kullanıcı siliniyor: ${booking.user.email}`);
      
      // Önce booking'i sil
      await prisma.booking.delete({
        where: { id: booking.id }
      });
      console.log(`✅ Booking silindi`);
      
      // Sonra kullanıcıyı sil
      await prisma.user.delete({
        where: { id: booking.user.id }
      });
      console.log(`✅ Generic kullanıcı silindi`);
      
    } else {
      console.log('✅ Bu booking zaten doğru kullanıcıya ait');
    }

    // Kalan booking'leri kontrol et
    const remainingBookings = await prisma.booking.findMany({
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
            brand: true,
            model: true,
            year: true
          }
        }
      }
    });

    console.log('\n📋 Kalan booking\'ler:');
    remainingBookings.forEach((booking, index) => {
      console.log(`${index + 1}. ${booking.vehicle.brand} ${booking.vehicle.model} (${booking.vehicle.year})`);
      console.log(`   Kullanıcı: ${booking.user?.email} (${booking.user?.firstName} ${booking.user?.lastName})`);
      console.log(`   Tarih: ${new Date(booking.startDate).toLocaleDateString('tr-TR')} - ${new Date(booking.endDate).toLocaleDateString('tr-TR')}`);
      console.log(`   Durum: ${booking.status}`);
      console.log('');
    });

  } catch (error) {
    console.error('❌ Hata:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixNewGenericUser();
