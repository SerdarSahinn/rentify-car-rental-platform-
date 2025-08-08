const { PrismaClient } = require('@prisma/client');

async function deleteAdmin() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🗑️ Admin kullanıcısı siliniyor...');
    
    // Admin kullanıcısını bul ve sil
    const admin = await prisma.user.findFirst({
      where: { email: 'admin@rentify.com' }
    });
    
    if (admin) {
      await prisma.user.delete({
        where: { id: admin.id }
      });
      console.log('✅ Admin kullanıcısı silindi:', admin.email);
    } else {
      console.log('❌ Admin kullanıcısı bulunamadı');
    }
    
  } catch (error) {
    console.error('Hata:', error);
  } finally {
    await prisma.$disconnect();
  }
}

deleteAdmin();
