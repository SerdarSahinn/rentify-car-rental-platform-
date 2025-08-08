const { PrismaClient } = require('@prisma/client');

async function makeAdmin() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔧 Kullanıcı admin yapılıyor...');
    
    // Bu clerk ID'ye sahip kullanıcıyı bul ve admin yap
    const user = await prisma.user.update({
      where: { clerkId: 'user_30xx2nt1HUnD68iyxqahHIduzFR' },
      data: { 
        role: 'ADMIN',
        email: 'admin@rentify.com'
      }
    });
    
    console.log('✅ Kullanıcı admin yapıldı:', {
      id: user.id,
      email: user.email,
      role: user.role,
      clerkId: user.clerkId
    });
    
  } catch (error) {
    console.error('Hata:', error);
  } finally {
    await prisma.$disconnect();
  }
}

makeAdmin();
