import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const handleClerkWebhook = async (req: Request, res: Response) => {
  try {
    const { type, data } = req.body;
    
    console.log('🔔 Clerk webhook alındı:', type);
    
    switch (type) {
      case 'user.created':
        await handleUserCreated(data);
        break;
      case 'user.updated':
        await handleUserUpdated(data);
        break;
      case 'user.deleted':
        await handleUserDeleted(data);
        break;
      default:
        console.log('ℹ️ İşlenmeyen webhook tipi:', type);
    }
    
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('❌ Clerk webhook hatası:', error);
    res.status(500).json({ error: 'Webhook işlenemedi' });
  }
};

async function handleUserCreated(userData: any) {
  try {
    console.log('👤 Yeni kullanıcı oluşturuluyor:', userData.id);
    
    const email = userData.email_addresses?.[0]?.email_address;
    if (!email) {
      console.warn('⚠️ Email bulunamadı:', userData.id);
      return;
    }
    
    // Kullanıcının zaten var olup olmadığını kontrol et
    const existingUser = await prisma.user.findUnique({
      where: { clerkId: userData.id }
    });
    
    if (existingUser) {
      console.log('⚠️ Kullanıcı zaten var:', email);
      return;
    }
    
    // Yeni kullanıcı oluştur
    const newUser = await prisma.user.create({
      data: {
        clerkId: userData.id,
        email: email,
        firstName: userData.first_name || 'Kullanıcı',
        lastName: userData.last_name || 'Adı',
        role: email.includes('admin') ? 'ADMIN' : 'USER',
        isActive: true,
      }
    });
    
    console.log('✅ Yeni kullanıcı oluşturuldu:', newUser.email);
  } catch (error) {
    console.error('❌ Kullanıcı oluşturma hatası:', error);
  }
}

async function handleUserUpdated(userData: any) {
  try {
    console.log('🔄 Kullanıcı güncelleniyor:', userData.id);
    
    const email = userData.email_addresses?.[0]?.email_address;
    if (!email) return;
    
    await prisma.user.update({
      where: { clerkId: userData.id },
      data: {
        email: email,
        firstName: userData.first_name || 'Kullanıcı',
        lastName: userData.last_name || 'Adı',
      }
    });
    
    console.log('✅ Kullanıcı güncellendi:', email);
  } catch (error) {
    console.error('❌ Kullanıcı güncelleme hatası:', error);
  }
}

async function handleUserDeleted(userData: any) {
  try {
    console.log('🗑️ Kullanıcı siliniyor:', userData.id);
    
    await prisma.user.update({
      where: { clerkId: userData.id },
      data: { isActive: false }
    });
    
    console.log('✅ Kullanıcı deaktif edildi');
  } catch (error) {
    console.error('❌ Kullanıcı silme hatası:', error);
  }
}
