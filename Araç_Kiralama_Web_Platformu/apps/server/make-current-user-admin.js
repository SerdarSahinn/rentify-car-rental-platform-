const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function makeCurrentUserAdmin() {
  try {
    console.log('🔧 serdar6437@gmail.com kullanıcısını tekrar ADMIN yapıyorum...');
    
    const updatedUser = await prisma.user.update({
      where: { email: 'serdar6437@gmail.com' },
      data: { role: 'ADMIN' }
    });
    
    console.log('✅ Kullanıcı ADMIN yapıldı:', updatedUser.email, '-', updatedUser.role);
    
    // Sahte admin'i sil
    await prisma.user.delete({
      where: { email: 'admin@rentify.com' }
    });
    
    console.log('🗑️ Sahte admin@rentify.com kullanıcısı silindi');
    
    // Son durumu göster
    const allUsers = await prisma.user.findMany({
      select: {
        email: true,
        firstName: true,
        lastName: true,
        role: true
      },
      orderBy: {
        role: 'desc'
      }
    });
    
    console.log('\n📋 Güncel kullanıcı listesi:');
    allUsers.forEach((user, index) => {
      const roleIcon = user.role === 'ADMIN' ? '👑' : '👤';
      console.log(`${index + 1}. ${roleIcon} ${user.email} (${user.firstName} ${user.lastName}) - ${user.role}`);
    });
    
  } catch (error) {
    console.error('❌ Hata:', error);
  } finally {
    await prisma.$disconnect();
  }
}

makeCurrentUserAdmin();
