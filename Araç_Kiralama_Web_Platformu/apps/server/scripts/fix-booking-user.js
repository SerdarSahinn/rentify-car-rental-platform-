const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixBookingUser() {
  try {
    console.log('🔧 Booking kullanıcısını düzeltiyorum...');
    
    // Bu booking'i bul
    const booking = await prisma.booking.findFirst({
      where: {
        vehicle: {
          brand: 'Mercedes',
          model: 'C-Class'
        }
      },
      include: {
        user: true,
        vehicle: true
      }
    });

    if (!booking) {
      console.log('❌ Booking bulunamadı!');
      return;
    }

    console.log(`✅ Booking bulundu: ${booking.vehicle.brand} ${booking.vehicle.model}`);
    console.log(`   Mevcut kullanıcı: ${booking.user?.email}`);
    console.log(`   Tarih: ${new Date(booking.startDate).toLocaleDateString('tr-TR')} - ${new Date(booking.endDate).toLocaleDateString('tr-TR')}`);

    // Gerçek kullanıcıyı bul (serdar6437@gmail.com)
    const realUser = await prisma.user.findFirst({
      where: { email: 'serdar6437@gmail.com' }
    });

    if (!realUser) {
      console.log('❌ Gerçek kullanıcı bulunamadı!');
      return;
    }

    console.log(`✅ Gerçek kullanıcı bulundu: ${realUser.email} (${realUser.firstName} ${realUser.lastName})`);

    // Booking'i gerçek kullanıcıya bağla
    await prisma.booking.update({
      where: { id: booking.id },
      data: { userId: realUser.id }
    });

    console.log(`✅ Booking ${realUser.email} kullanıcısına bağlandı!`);

    // Sonucu kontrol et
    const updatedBooking = await prisma.booking.findUnique({
      where: { id: booking.id },
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

    console.log('\n🎉 Güncellenmiş booking:');
    console.log(`   Araç: ${updatedBooking.vehicle.brand} ${updatedBooking.vehicle.model} (${updatedBooking.vehicle.year})`);
    console.log(`   Kullanıcı: ${updatedBooking.user.email} (${updatedBooking.user.firstName} ${updatedBooking.user.lastName})`);
    console.log(`   Tarih: ${new Date(updatedBooking.startDate).toLocaleDateString('tr-TR')} - ${new Date(updatedBooking.endDate).toLocaleDateString('tr-TR')}`);
    console.log(`   Durum: ${updatedBooking.status}`);

  } catch (error) {
    console.error('❌ Hata:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixBookingUser();
