const { PrismaClient } = require('@prisma/client');

async function fixAdmin() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔧 Admin düzeltiliyor...');
    
    // Admin'i bul
    const admin = await prisma.user.findFirst({
      where: { email: 'admin@rentify.com' }
    });
    
    if (admin) {
      console.log('Mevcut admin:', admin.email, admin.clerkId);
      
      // Clerk ID'yi güncelle
      await prisma.user.update({
        where: { id: admin.id },
        data: { clerkId: 'user_30xx2nt1HUnD68iyxqahHIduzFR' }
      });
      
      console.log('✅ Admin güncellendi!');
    } else {
      console.log('❌ Admin bulunamadı');
    }
    
  } catch (error) {
    console.error('Hata:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixAdmin();
