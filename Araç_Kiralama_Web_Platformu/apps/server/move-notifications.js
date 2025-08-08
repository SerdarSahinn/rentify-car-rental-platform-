const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function moveNotifications() {
  try {
    console.log('🔍 Notification taşıma işlemi başlıyor...');
    
    // Serdar kullanıcısını bul
    const serdarUser = await prisma.user.findUnique({
      where: { email: 'serdar6437@gmail.com' }
    });
    
    if (!serdarUser) {
      console.log('❌ Serdar kullanıcısı bulunamadı!');
      return;
    }
    
    console.log('✅ Serdar kullanıcısı bulundu:', serdarUser.email);
    
    // Mevcut notification'ları al
    const notifications = await prisma.notification.findMany({
      where: {
        user: {
          email: 'user_user_30rwjn7pzhFn8lj0OuvIPrsUs0u@rentify.com'
        }
      }
    });
    
    console.log('📧 Taşınacak notification sayısı:', notifications.length);
    
    // Notification'ları Serdar'a taşı
    for (const notification of notifications) {
      await prisma.notification.update({
        where: { id: notification.id },
        data: { userId: serdarUser.id }
      });
      console.log('✅ Notification taşındı:', notification.title);
    }
    
    console.log('🎉 Tüm notification\'lar başarıyla taşındı!');
    
    // Kontrol et
    const serdarNotifications = await prisma.notification.findMany({
      where: { userId: serdarUser.id }
    });
    
    console.log('📊 Serdar\'ın notification sayısı:', serdarNotifications.length);
    
  } catch (error) {
    console.error('❌ Hata:', error);
  } finally {
    await prisma.$disconnect();
  }
}

moveNotifications();
