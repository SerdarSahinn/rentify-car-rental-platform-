const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkSerdar() {
  try {
    console.log('🔍 Serdar kullanıcısı kontrol ediliyor...');
    
    // Serdar kullanıcısını bul
    const serdarUser = await prisma.user.findUnique({
      where: { email: 'serdar6437@gmail.com' }
    });
    
    if (serdarUser) {
      console.log('✅ Serdar kullanıcısı bulundu:');
      console.log('  - ID:', serdarUser.id);
      console.log('  - Email:', serdarUser.email);
      console.log('  - ClerkId:', serdarUser.clerkId);
      
      // Bu kullanıcının notification'larını kontrol et
      const notifications = await prisma.notification.findMany({
        where: { userId: serdarUser.id }
      });
      
      console.log('📧 Serdar\'ın notification sayısı:', notifications.length);
      
      if (notifications.length > 0) {
        console.log('📋 İlk 3 notification:');
        notifications.slice(0, 3).forEach((n, i) => {
          console.log(`  ${i+1}. ${n.title} - ${n.type}`);
        });
      }
      
    } else {
      console.log('❌ Serdar kullanıcısı bulunamadı!');
    }
    
    // Tüm kullanıcıları listele
    const allUsers = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        clerkId: true
      }
    });
    
    console.log('\n👥 Tüm kullanıcılar:');
    allUsers.forEach(user => {
      console.log(`  - ${user.email} (ID: ${user.id})`);
    });
    
  } catch (error) {
    console.error('❌ Hata:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkSerdar();
