const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixUser() {
  try {
    console.log('🔍 Kullanıcı düzeltme başlıyor...');
    
    // Mevcut kullanıcıları listele
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        clerkId: true
      }
    });
    
    console.log('👥 Mevcut kullanıcılar:', users);
    
    // Serdar'ın email'ini ara
    const serdarUser = users.find(u => u.email === 'serdar6437@gmail.com');
    
    if (serdarUser) {
      console.log('✅ Serdar kullanıcısı bulundu:', serdarUser);
      
      // Bu kullanıcının notification'larını kontrol et
      const notifications = await prisma.notification.findMany({
        where: {
          userId: serdarUser.id
        }
      });
      
      console.log('📧 Serdar\'ın notification\'ları:', notifications);
      console.log('📊 Notification sayısı:', notifications.length);
      
    } else {
      console.log('❌ Serdar kullanıcısı bulunamadı!');
      console.log('🔍 Yeni kullanıcı oluşturulacak...');
      
      // Yeni Serdar kullanıcısı oluştur
      const newSerdar = await prisma.user.create({
        data: {
          email: 'serdar6437@gmail.com',
          firstName: 'Serdar',
          lastName: 'Şahin',
          clerkId: 'serdar_clerk_id', // Geçici ID
          role: 'USER',
          isActive: true
        }
      });
      
      console.log('✅ Yeni Serdar kullanıcısı oluşturuldu:', newSerdar);
      
      // Test notification'ı oluştur
      const testNotification = await prisma.notification.create({
        data: {
          userId: newSerdar.id,
          type: 'TEST',
          title: 'Test Mesajı',
          message: 'Bu bir test mesajıdır. Notification sistemi çalışıyor!',
          isRead: false
        }
      });
      
      console.log('✅ Test notification oluşturuldu:', testNotification);
    }
    
  } catch (error) {
    console.error('❌ Hata:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixUser();
