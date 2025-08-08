const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function findUserByEmail() {
  try {
    console.log('🔍 Generic email\'in sahibini arıyorum...');
    
    const genericEmail = 'user_user_30rwjn7pzhFn8lj0OuvIPrsUs0u@rentify.com';
    
    // Bu email'e sahip kullanıcıyı bul
    const user = await prisma.user.findFirst({
      where: { email: genericEmail }
    });

    if (user) {
      console.log('✅ Kullanıcı bulundu:');
      console.log(`   ID: ${user.id}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Ad: ${user.firstName} ${user.lastName}`);
      console.log(`   Clerk ID: ${user.clerkId}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Oluşturulma: ${user.createdAt}`);

      // Bu kullanıcının booking'lerini bul
      const bookings = await prisma.booking.findMany({
        where: { userId: user.id },
        include: {
          vehicle: {
            select: {
              brand: true,
              model: true,
              year: true
            }
          }
        }
      });

      console.log(`\n📋 Bu kullanıcının ${bookings.length} booking'i var:`);
      bookings.forEach((booking, index) => {
        console.log(`   ${index + 1}. ${booking.vehicle?.brand} ${booking.vehicle?.model} (${booking.vehicle?.year}) - ${booking.status}`);
        console.log(`      Tarih: ${new Date(booking.startDate).toLocaleDateString('tr-TR')} - ${new Date(booking.endDate).toLocaleDateString('tr-TR')}`);
        console.log(`      Ücret: ₺${booking.totalPrice}`);
      });

    } else {
      console.log('❌ Bu email\'e sahip kullanıcı bulunamadı!');
      
      // Tüm kullanıcıları listele
      const allUsers = await prisma.user.findMany({
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          clerkId: true
        }
      });

      console.log('\n📋 Mevcut tüm kullanıcılar:');
      allUsers.forEach((user, index) => {
        console.log(`   ${index + 1}. ${user.email} (${user.firstName} ${user.lastName}) - ${user.clerkId}`);
      });
    }

  } catch (error) {
    console.error('❌ Hata:', error);
  } finally {
    await prisma.$disconnect();
  }
}

findUserByEmail();
