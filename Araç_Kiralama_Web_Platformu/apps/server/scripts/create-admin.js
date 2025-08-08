const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createAdmin() {
  try {
    console.log('🔧 Admin kullanıcısı oluşturuluyor...');
    
    // Mevcut admin'i sil
    const existingAdmin = await prisma.user.findFirst({
      where: { email: 'admin@rentify.com' }
    });

    if (existingAdmin) {
      console.log('🗑️ Mevcut admin siliniyor:', existingAdmin.email);
      await prisma.user.delete({
        where: { id: existingAdmin.id }
      });
    }

    // Yeni admin oluştur - Clerk ID'yi frontend'den alacağız
    const admin = await prisma.user.create({
      data: {
        clerkId: 'user_30xx2nt1HUnD68iyxqahHIduzFR', // Bu ID'yi frontend'den alacağız
        email: 'admin@rentify.com',
        firstName: 'Admin',
        lastName: 'User',
        role: 'ADMIN',
        isActive: true,
        phone: '5551234567'
      }
    });

    console.log('✅ Admin kullanıcısı başarıyla oluşturuldu:');
    console.log('📧 Email:', admin.email);
    console.log('🆔 Clerk ID:', admin.clerkId);
    console.log('👑 Role:', admin.role);

    return admin;
  } catch (error) {
    console.error('❌ Admin oluşturma hatası:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();

