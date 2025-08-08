const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createNewAdmin() {
  try {
    // Eski admin'i sil
    await prisma.user.deleteMany({
      where: { 
        email: 'serdar@rentify.com' 
      }
    });

    console.log('✅ Eski admin silindi');

    // Yeni admin oluştur
    const admin = await prisma.user.create({
      data: {
        clerkId: 'admin_serdar_2024_new',
        email: 'admin@rentify.com',
        firstName: 'Admin',
        lastName: 'User',
        role: 'ADMIN',
        isActive: true,
        phone: '5551234567'
      }
    });

    console.log('✅ Yeni admin oluşturuldu:', admin.email);
    console.log('📧 Email: admin@rentify.com');
    console.log('🔑 Şifre: Rentify2024! (Clerk\'te ayarlanacak)');
    console.log('');
    console.log('📋 Clerk\'te yapılacaklar:');
    console.log('1. Clerk Dashboard\'a git');
    console.log('2. Users > Add User');
    console.log('3. Email: admin@rentify.com');
    console.log('4. Password: Rentify2024!');
    console.log('5. User\'ı oluştur');
  } catch (error) {
    console.error('❌ Hata:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createNewAdmin();

