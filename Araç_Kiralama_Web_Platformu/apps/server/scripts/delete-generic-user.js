const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function deleteGenericUser() {
  try {
    console.log('🗑️ Generic kullanıcıyı siliyorum...');
    
    const genericEmail = 'user_user_30rwjn7pzhFn8lj0OuvIPrsUs0u@rentify.com';
    
    // Bu kullanıcıyı bul
    const user = await prisma.user.findFirst({
      where: { email: genericEmail }
    });

    if (user) {
      console.log(`✅ Kullanıcı bulundu: ${user.email}`);
      
      // Önce booking'lerini sil
      const deletedBookings = await prisma.booking.deleteMany({
        where: { userId: user.id }
      });
      console.log(`✅ ${deletedBookings.count} booking silindi`);
      
      // Sonra kullanıcıyı sil
      await prisma.user.delete({
        where: { id: user.id }
      });
      console.log(`✅ Kullanıcı silindi: ${user.email}`);
      
    } else {
      console.log('❌ Bu email\'e sahip kullanıcı bulunamadı!');
    }

    // Kalan kullanıcıları kontrol et
    const remainingUsers = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true
      }
    });

    console.log('\n📋 Kalan kullanıcılar:');
    remainingUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email} (${user.firstName} ${user.lastName}) - ${user.role}`);
    });

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
        }
      }
    });

    console.log(`\n📋 Kalan booking sayısı: ${remainingBookings.length}`);
    
    if (remainingBookings.length > 0) {
      console.log('\n🚗 Kalan booking\'ler:');
      remainingBookings.forEach((booking, index) => {
        console.log(`${index + 1}. ${booking.user?.email || 'Kullanıcı yok'} - ${booking.status}`);
      });
    }

    console.log('\n🎉 Generic kullanıcı temizlendi!');

  } catch (error) {
    console.error('❌ Hata:', error);
  } finally {
    await prisma.$disconnect();
  }
}

deleteGenericUser();
