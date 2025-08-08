const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testNotification() {
  try {
    console.log('🔍 Notification test başlıyor...');
    
    // BMW X5 booking'ini bul
    const booking = await prisma.booking.findFirst({
      where: {
        vehicle: {
          brand: 'BMW',
          model: 'X5'
        }
      },
      include: {
        vehicle: true,
        user: true
      }
    });
    
    if (!booking) {
      console.log('❌ BMW X5 booking bulunamadı');
      return;
    }
    
    console.log('✅ Booking bulundu:', {
      id: booking.id,
      userId: booking.userId,
      userEmail: booking.user?.email,
      vehicle: `${booking.vehicle?.brand} ${booking.vehicle?.model}`,
      status: booking.status
    });
    
    // Notification oluştur
    const notification = await prisma.notification.create({
      data: {
        userId: booking.userId,
        type: 'BOOKING_STATUS',
        title: 'Form Doldurmanız Gerekiyor',
        message: `Kiralama işleminiz için gerekli belgeleri doldurmanız gerekiyor. TC kimlik, sürücü belgesi ve diğer bilgileri içeren formu doldurun.`,
        isRead: false,
        data: JSON.stringify({
          bookingId: booking.id,
          status: 'FORM_REQUIRED'
        })
      }
    });
    
    console.log('✅ Notification oluşturuldu:', notification.id);
    
    // Kullanıcının notification'larını kontrol et
    const userNotifications = await prisma.notification.findMany({
      where: { userId: booking.userId }
    });
    
    console.log('📧 Kullanıcının notification sayısı:', userNotifications.length);
    userNotifications.forEach((notif, index) => {
      console.log(`${index + 1}. ${notif.title}: ${notif.message}`);
    });
    
  } catch (error) {
    console.error('❌ Test hatası:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testNotification();


