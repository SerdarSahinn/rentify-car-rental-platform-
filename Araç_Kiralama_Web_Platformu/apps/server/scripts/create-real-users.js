const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createRealUsers() {
  try {
    console.log('🔍 Gerçek kullanıcılar oluşturuluyor...');
    
    // Mevcut kullanıcıları sil (admin hariç)
    const usersToDelete = await prisma.user.findMany({
      where: {
        role: 'USER',
        email: {
          not: 'serdar6437@gmail.com' // Serdar'ı koru
        }
      }
    });

    console.log(`🗑️ ${usersToDelete.length} kullanıcı silinecek...`);
    
    for (const user of usersToDelete) {
      await prisma.user.delete({
        where: { id: user.id }
      });
      console.log(`✅ ${user.email} silindi`);
    }

    // Gerçek kullanıcılar oluştur
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

    console.log('\n👥 Gerçek kullanıcılar oluşturuluyor...');
    
    for (const userData of realUsers) {
      const user = await prisma.user.create({
        data: userData
      });
      console.log(`✅ ${user.email} (${user.firstName} ${user.lastName}) oluşturuldu`);
    }

    // Booking'leri farklı kullanıcılara dağıt
    const bookings = await prisma.booking.findMany({
      include: {
        user: true
      }
    });

    const newUsers = await prisma.user.findMany({
      where: { role: 'USER' }
    });

    console.log('\n🔄 Booking\'ler farklı kullanıcılara dağıtılıyor...');
    
    for (let i = 0; i < bookings.length; i++) {
      const booking = bookings[i];
      const userIndex = i % newUsers.length;
      const newUser = newUsers[userIndex];
      
      await prisma.booking.update({
        where: { id: booking.id },
        data: { userId: newUser.id }
      });
      
      console.log(`✅ Booking ${booking.id} → ${newUser.email} kullanıcısına atandı`);
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
        }
      }
    });

    console.log('\n📋 Final booking durumu:');
    finalBookings.forEach((booking, index) => {
      console.log(`${index + 1}. Booking ID: ${booking.id} - Kullanıcı: ${booking.user?.email} (${booking.user?.firstName} ${booking.user?.lastName})`);
    });

  } catch (error) {
    console.error('❌ Hata:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createRealUsers();
