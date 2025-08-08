const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testNotifications() {
  try {
    console.log('🔍 Notification test başlıyor...');
    
    // Tüm kullanıcıları listele
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        clerkId: true
      }
    });
    
    console.log('👥 Kullanıcılar:', users);
    
    // Tüm notification'ları listele
    const notifications = await prisma.notification.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true
          }
        }
      }
    });
    
    console.log('📧 Tüm notification\'lar:', notifications);
    console.log('📊 Notification sayısı:', notifications.length);
    
    // Serdar'ın notification'larını bul
    const serdarUser = users.find(u => u.email === 'serdar6437@gmail.com');
    if (serdarUser) {
      console.log('🔍 Serdar kullanıcısı bulundu:', serdarUser);
      
      const serdarNotifications = await prisma.notification.findMany({
        where: {
          userId: serdarUser.id
        }
      });
      
      console.log('📧 Serdar\'ın notification\'ları:', serdarNotifications);
      console.log('📊 Serdar\'ın notification sayısı:', serdarNotifications.length);
    } else {
      console.log('❌ Serdar kullanıcısı bulunamadı!');
    }
    
  } catch (error) {
    console.error('❌ Test hatası:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testNotifications();
