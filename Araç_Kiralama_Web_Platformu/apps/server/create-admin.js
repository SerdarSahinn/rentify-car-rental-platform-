const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createAdmin() {
  try {
    const admin = await prisma.user.upsert({
      where: { email: 'admin@rentify.com' },
      update: { role: 'ADMIN' },
      create: {
        clerkId: 'admin_clerk_manual',
        email: 'admin@rentify.com',
        firstName: 'Admin',
        lastName: 'User',
        role: 'ADMIN',
      },
    });
    console.log('✅ Admin kullanıcısı oluşturuldu:', admin.email);
    console.log('🔍 Admin role:', admin.role);
  } catch (error) {
    console.error('❌ Hata:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();

