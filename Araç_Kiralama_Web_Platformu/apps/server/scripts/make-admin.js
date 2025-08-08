const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function makeAdmin() {
  try {
    // Kullanıcıyı admin yap
    const user = await prisma.user.update({
      where: { 
        clerkId: 'user_30rwjn7pzhFn8lj0OuvIPrsUs0u' 
      },
      data: {
        role: 'ADMIN'
      }
    });

    console.log('✅ Kullanıcı admin yapıldı:', user.email);
  } catch (error) {
    console.error('❌ Hata:', error);
  } finally {
    await prisma.$disconnect();
  }
}

makeAdmin();

