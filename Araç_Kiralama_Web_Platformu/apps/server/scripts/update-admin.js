const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function updateAdmin() {
  try {
    // Mevcut admin'i güncelle
    const admin = await prisma.user.updateMany({
      where: { 
        role: 'ADMIN' 
      },
      data: {
        clerkId: 'admin_serdar_2024',
        email: 'serdar@rentify.com',
        firstName: 'Serdar',
        lastName: 'Admin',
        phone: '5551234567'
      }
    });

    console.log('✅ Admin güncellendi');
    console.log('📧 Email: serdar@rentify.com');
    console.log('🔑 Şifre: 123 (Clerk\'te ayarlanacak)');
    
    // Güncellenmiş admin'i göster
    const updatedAdmin = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    });
    
    console.log('👤 Admin bilgileri:', updatedAdmin);
  } catch (error) {
    console.error('❌ Hata:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateAdmin();

