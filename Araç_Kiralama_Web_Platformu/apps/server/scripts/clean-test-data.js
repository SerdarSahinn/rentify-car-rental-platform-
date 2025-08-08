const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function cleanTestData() {
  try {
    console.log('🧹 Test verilerini temizliyorum...');
    
    // Test kullanıcılarını bul
    const testUsers = [
      'mehmet.kaya@yahoo.com',
      'ayse.demir@hotmail.com', 
      'ahmet.yilmaz@gmail.com',
      'ali.celik@outlook.com',
      'fatma.ozturk@gmail.com'
    ];

    console.log('🗑️ Test kullanıcıları siliniyor...');
    
    for (const email of testUsers) {
      const user = await prisma.user.findFirst({
        where: { email: email }
      });
      
      if (user) {
        // Önce bu kullanıcının booking'lerini sil
        await prisma.booking.deleteMany({
          where: { userId: user.id }
        });
        console.log(`✅ ${email} kullanıcısının booking'leri silindi`);
        
        // Sonra kullanıcıyı sil
        await prisma.user.delete({
          where: { id: user.id }
        });
        console.log(`✅ ${email} kullanıcısı silindi`);
      }
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

    console.log(`\n📋 Kalan booking sayısı: ${remainingBookings.length}`);
    
    if (remainingBookings.length > 0) {
      console.log('\n🚗 Kalan booking\'ler:');
      remainingBookings.forEach((booking, index) => {
        console.log(`${index + 1}. ${booking.user?.email || 'Kullanıcı yok'} → ${booking.vehicle?.brand} ${booking.vehicle?.model} - ${booking.status}`);
      });
    } else {
      console.log('✅ Hiç booking kalmadı!');
    }

    console.log('\n🎉 Temizlik tamamlandı! Artık sadece gerçek kullanıcılar var.');

  } catch (error) {
    console.error('❌ Hata:', error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanTestData();
