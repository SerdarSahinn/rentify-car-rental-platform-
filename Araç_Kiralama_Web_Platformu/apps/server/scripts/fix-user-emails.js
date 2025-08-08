const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixUserEmails() {
  try {
    console.log('🔍 Kullanıcı email\'leri düzeltiliyor...');
    
    // Mevcut kullanıcıları listele
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        clerkId: true,
        role: true
      }
    });

    console.log('👥 Mevcut kullanıcılar:');
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email} (${user.firstName || 'Ad yok'} ${user.lastName || 'Soyad yok'}) - ${user.role}`);
    });

    // Generic email'li kullanıcıları düzelt
    const genericUsers = users.filter(user => user.email.includes('user_user_'));
    
    if (genericUsers.length > 0) {
      console.log(`\n🔧 ${genericUsers.length} generic kullanıcı bulundu, düzeltiliyor...`);
      
      for (let i = 0; i < genericUsers.length; i++) {
        const user = genericUsers[i];
        const newEmail = `musteri${i + 1}@gmail.com`;
        
        await prisma.user.update({
          where: { id: user.id },
          data: {
            email: newEmail,
            firstName: `Müşteri ${i + 1}`,
            lastName: 'Kullanıcı'
          }
        });
        
        console.log(`✅ ${user.email} → ${newEmail} olarak güncellendi`);
      }
    } else {
      console.log('✅ Generic email\'li kullanıcı bulunamadı');
    }

    // Güncellenmiş kullanıcıları listele
    const updatedUsers = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true
      }
    });

    console.log('\n📋 Güncellenmiş kullanıcı listesi:');
    updatedUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email} (${user.firstName} ${user.lastName}) - ${user.role}`);
    });

  } catch (error) {
    console.error('❌ Hata:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixUserEmails();
