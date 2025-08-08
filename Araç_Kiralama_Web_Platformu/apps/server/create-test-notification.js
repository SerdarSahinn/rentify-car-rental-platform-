const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createTestNotification() {
  try {
    console.log('🔍 Test notification oluşturuluyor...');
    
    // Serdar kullanıcısını bul
    const serdarUser = await prisma.user.findUnique({
      where: { email: 'serdar6437@gmail.com' }
    });
    
    if (!serdarUser) {
      console.log('❌ Serdar kullanıcısı bulunamadı!');
      return;
    }
    
    console.log('✅ Serdar kullanıcısı bulundu:', serdarUser.email);
    
    // Test notification'ı oluştur
    const testNotification = await prisma.notification.create({
      data: {
        userId: serdarUser.id,
        type: 'TEST',
        title: 'Test Mesajı - Sistem Çalışıyor!',
        message: 'Bu bir test mesajıdır. Notification sistemi başarıyla çalışıyor!',
        isRead: false
      }
    });
    
    console.log('✅ Test notification oluşturuldu:', testNotification.title);
    
    // Kontrol et
    const notifications = await prisma.notification.findMany({
      where: { userId: serdarUser.id },
      orderBy: { createdAt: 'desc' },
      take: 5
    });
    
    console.log('📊 Son 5 notification:');
    notifications.forEach((n, i) => {
      console.log(`  ${i+1}. ${n.title} (${n.type})`);
    });
    
  } catch (error) {
    console.error('❌ Hata:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestNotification();
