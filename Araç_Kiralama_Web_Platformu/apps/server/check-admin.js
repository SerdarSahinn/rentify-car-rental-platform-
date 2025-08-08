const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkAdmin() {
  try {
    console.log('🔍 Admin kullanıcısı kontrol ediliyor...');
    
    const admin = await prisma.user.findFirst({
      where: { email: 'admin@rentify.com' }
    });
    
    console.log('Admin kullanıcısı:', admin);
    
    const allUsers = await prisma.user.findMany();
    console.log('Tüm kullanıcılar:', allUsers.map(u => ({ 
      id: u.id, 
      email: u.email, 
      role: u.role,
      clerkId: u.clerkId 
    })));
    
    const allBookings = await prisma.booking.findMany({
      include: {
        user: true,
        vehicle: true
      }
    });
    
    console.log('Tüm kiralamalar:', allBookings.map(b => ({
      id: b.id,
      userId: b.userId,
      userEmail: b.user?.email,
      vehicleId: b.vehicleId,
      vehicleName: `${b.vehicle?.brand} ${b.vehicle?.model}`,
      status: b.status,
      startDate: b.startDate,
      endDate: b.endDate
    })));
    
  } catch (error) {
    console.error('❌ Hata:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAdmin();
