const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createRealUser() {
  try {
    console.log('🔍 Gerçek kullanıcı oluşturuluyor...');
    
    // Gerçek kullanıcı oluştur
    const realUser = {
      email: 'serdar.kullanici@gmail.com',
      firstName: 'Serdar',
      lastName: 'Kullanıcı',
      clerkId: 'user_serdar_real_123',
      role: 'USER',
      isActive: true
    };

    // Kullanıcı var mı kontrol et
    let user = await prisma.user.findFirst({
      where: { email: realUser.email }
    });
    
    if (!user) {
      user = await prisma.user.create({
        data: realUser
      });
      console.log(`✅ Gerçek kullanıcı oluşturuldu: ${user.email} (${user.firstName} ${user.lastName})`);
    } else {
      console.log(`✅ Kullanıcı zaten var: ${user.email} (${user.firstName} ${user.lastName})`);
    }

    // Kullanıcı bilgilerini göster
    console.log('\n📋 Kullanıcı bilgileri:');
    console.log(`Email: ${user.email}`);
    console.log(`Ad: ${user.firstName} ${user.lastName}`);
    console.log(`ID: ${user.id}`);
    console.log(`Clerk ID: ${user.clerkId}`);

    console.log('\n🎯 Şimdi bu kullanıcı ile giriş yapıp kiralama isteği gönderebilirsin!');

  } catch (error) {
    console.error('❌ Hata:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createRealUser();
