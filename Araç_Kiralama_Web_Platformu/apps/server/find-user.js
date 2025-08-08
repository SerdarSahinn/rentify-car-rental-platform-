const { PrismaClient } = require('@prisma/client');

async function findUser() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔍 Kullanıcı aranıyor...');
    
    // Bu clerk ID'ye sahip kullanıcıyı bul
    const user = await prisma.user.findUnique({
      where: { clerkId: 'user_30xx2nt1HUnD68iyxqahHIduzFR' }
    });
    
    if (user) {
      console.log('✅ Kullanıcı bulundu:', {
        id: user.id,
        email: user.email,
        role: user.role,
        clerkId: user.clerkId
      });
    } else {
      console.log('❌ Kullanıcı bulunamadı');
    }
    
  } catch (error) {
    console.error('Hata:', error);
  } finally {
    await prisma.$disconnect();
  }
}

findUser();
