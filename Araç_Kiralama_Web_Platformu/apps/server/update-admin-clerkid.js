const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updateAdminClerkId() {
  try {
    console.log('🔍 Admin kullanıcısının Clerk ID\'si güncelleniyor...');
    
    // Admin kullanıcısını bul
    const admin = await prisma.user.findFirst({
      where: { email: 'admin@rentify.com' }
    });
    
    if (!admin) {
      console.log('❌ Admin kullanıcısı bulunamadı!');
      return;
    }
    
    console.log('Mevcut admin:', admin);
    
    // Clerk ID'yi güncelle - frontend'den gelen token'daki ID'yi kullan
    // Bu ID'yi frontend console'dan alacağız
    const newClerkId = 'user_30xx2nt1HUnD68iyxqahHIduzFR'; // Bu ID'yi frontend'den alacağız
    
    const updatedAdmin = await prisma.user.update({
      where: { id: admin.id },
      data: { clerkId: newClerkId },
      select: {
        id: true,
        email: true,
        role: true,
        clerkId: true
      }
    });
    
    console.log('✅ Admin güncellendi:', updatedAdmin);
    
  } catch (error) {
    console.error('❌ Hata:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateAdminClerkId();
