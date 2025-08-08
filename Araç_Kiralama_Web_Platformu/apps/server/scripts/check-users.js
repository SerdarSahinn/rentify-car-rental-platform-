const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkUsers() {
  try {
    console.log('🔍 Kullanıcılar kontrol ediliyor...');
    
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        clerkId: true,
        role: true,
        createdAt: true
      }
    });

    console.log('👥 Toplam kullanıcı sayısı:', users.length);
    console.log('\n📋 Kullanıcı listesi:');
    
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email} (${user.firstName || 'Ad yok'} ${user.lastName || 'Soyad yok'}) - ${user.role}`);
    });

    // Booking'leri de kontrol et
    const bookings = await prisma.booking.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });

    console.log('\n🚗 Bookinglerdeki kullanıcılar:');
    bookings.forEach((booking, index) => {
      console.log(`${index + 1}. Booking ID: ${booking.id} - Kullanıcı: ${booking.user?.email || 'Kullanıcı yok'} (${booking.user?.firstName || 'Ad yok'} ${booking.user?.lastName || 'Soyad yok'})`);
    });

  } catch (error) {
    console.error('❌ Hata:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUsers();
