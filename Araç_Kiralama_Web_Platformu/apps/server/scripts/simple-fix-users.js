const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function simpleFixUsers() {
  try {
    console.log('🔍 Kullanıcı email\'leri basit düzeltme...');
    
    // Mevcut booking'leri al
    const bookings = await prisma.booking.findMany({
      include: {
        user: true
      }
    });

    console.log(`📋 ${bookings.length} booking bulundu`);

    // Her booking için farklı kullanıcı email'i ata
    const realEmails = [
      'ahmet.yilmaz@gmail.com',
      'ayse.demir@hotmail.com', 
      'mehmet.kaya@yahoo.com',
      'fatma.ozturk@gmail.com',
      'ali.celik@outlook.com',
      'zeynep.arslan@gmail.com',
      'can.ozdemir@yahoo.com',
      'elif.yildiz@hotmail.com'
    ];

    for (let i = 0; i < bookings.length; i++) {
      const booking = bookings[i];
      const emailIndex = i % realEmails.length;
      const newEmail = realEmails[emailIndex];
      
      // Kullanıcıyı güncelle veya oluştur
      let user = await prisma.user.findFirst({
        where: { email: newEmail }
      });

      if (!user) {
        const names = newEmail.split('@')[0].split('.');
        user = await prisma.user.create({
          data: {
            email: newEmail,
            firstName: names[0].charAt(0).toUpperCase() + names[0].slice(1),
            lastName: names[1] ? names[1].charAt(0).toUpperCase() + names[1].slice(1) : 'Kullanıcı',
            clerkId: `user_${i}_${Date.now()}`,
            role: 'USER',
            isActive: true
          }
        });
        console.log(`✅ Yeni kullanıcı oluşturuldu: ${newEmail}`);
      }

      // Booking'i güncelle
      await prisma.booking.update({
        where: { id: booking.id },
        data: { userId: user.id }
      });

      console.log(`✅ Booking ${i + 1} → ${newEmail} kullanıcısına atandı`);
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

    console.log('\n🎉 Final durum:');
    finalBookings.forEach((booking, index) => {
      console.log(`${index + 1}. ${booking.user?.email} (${booking.user?.firstName} ${booking.user?.lastName})`);
    });

  } catch (error) {
    console.error('❌ Hata:', error);
  } finally {
    await prisma.$disconnect();
  }
}

simpleFixUsers();
