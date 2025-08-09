import { Request, Response } from 'express';
import { prisma } from '../../config/database';
import { AuthRequest } from '../../middlewares/auth';

export class NotificationController {
  // Kullanıcının bildirimlerini getir
  async getUserNotifications(req: AuthRequest, res: Response) {
    try {
      console.log('🔍 getUserNotifications çağrıldı');
      console.log('🔍 req.user:', req.user);
      console.log('🔍 req.body:', req.body);
      
      let userId = req.user?.id;
      console.log('🔍 userId from token:', userId);
      
      // Email ile kullanıcı bulma (her zaman dene)
      if (req.body?.userEmail) {
        console.log('🔍 Email ile kullanıcı aranıyor:', req.body.userEmail);
        
        const userByEmail = await prisma.user.findUnique({
          where: { email: req.body.userEmail }
        });
        
        if (userByEmail) {
          userId = userByEmail.id;
          console.log('✅ Email ile kullanıcı bulundu:', userByEmail.email);
          console.log('✅ Yeni userId:', userId);
        } else {
          console.log('❌ Email ile kullanıcı bulunamadı:', req.body.userEmail);
          
          // Kullanıcı yoksa oluştur
          console.log('🔍 Yeni kullanıcı oluşturuluyor...');
          const newUser = await prisma.user.create({
            data: {
              email: req.body.userEmail,
              firstName: 'Kullanıcı',
              lastName: 'Adı',
              clerkId: req.user?.id || 'temp_clerk_id',
              role: 'USER',
              isActive: true
            }
          });
          
          userId = newUser.id;
          console.log('✅ Yeni kullanıcı oluşturuldu:', newUser.email);
        }
      }
      
      if (!userId) {
        console.log('❌ Kullanıcı kimliği bulunamadı');
        return res.status(401).json({ error: 'Kullanıcı kimliği gerekli' });
      }

      const notifications = await prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' }
      });

      console.log('✅ Notifications bulundu:', notifications.length);
      console.log('🔍 Notifications:', notifications);

      return res.json({
        success: true,
        data: notifications
      });
    } catch (error) {
      console.error('❌ Bildirim getirme hatası:', error);
      return res.status(500).json({ error: 'Bildirimler getirilemedi' });
    }
  }

  // Bildirimi okundu olarak işaretle
  async markAsRead(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      const { notificationId } = req.params;

      if (!userId) {
        return res.status(401).json({ error: 'Kullanıcı kimliği gerekli' });
      }

      const notification = await prisma.notification.update({
        where: { 
          id: notificationId,
          userId: userId // Sadece kendi bildirimini güncelleyebilir
        },
        data: { isRead: true }
      });

      return res.json({
        success: true,
        data: notification
      });
    } catch (error) {
      console.error('Bildirim güncelleme hatası:', error);
      return res.status(500).json({ error: 'Bildirim güncellenemedi' });
    }
  }

  // Tüm bildirimleri okundu olarak işaretle
  async markAllAsRead(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'Kullanıcı kimliği gerekli' });
      }

      await prisma.notification.updateMany({
        where: { userId, isRead: false },
        data: { isRead: true }
      });

      return res.json({
        success: true,
        message: 'Tüm bildirimler okundu olarak işaretlendi'
      });
    } catch (error) {
      console.error('Bildirim güncelleme hatası:', error);
      return res.status(500).json({ error: 'Bildirimler güncellenemedi' });
    }
  }

  // Bildirimi sil
  async deleteNotification(req: AuthRequest, res: Response) {
    try {
      console.log('🗑️ deleteNotification çağrıldı');
      
      let userId = req.user?.id;
      const { notificationId } = req.params;
      
      console.log('🔍 userId:', userId);
      console.log('🔍 notificationId:', notificationId);

      // Email ile kullanıcı bulma (getUserNotifications ile aynı mantık)
      if (req.body?.userEmail) {
        console.log('🔍 Email ile kullanıcı aranıyor:', req.body.userEmail);
        
        const userByEmail = await prisma.user.findUnique({
          where: { email: req.body.userEmail }
        });
        
        if (userByEmail) {
          userId = userByEmail.id;
          console.log('✅ Email ile kullanıcı bulundu:', userByEmail.email);
        }
      }

      if (!userId) {
        console.log('❌ Kullanıcı kimliği bulunamadı');
        return res.status(401).json({ error: 'Kullanıcı kimliği gerekli' });
      }

      // Sadece kendi bildirimini silebilir
      const notification = await prisma.notification.findFirst({
        where: { 
          id: notificationId,
          userId: userId 
        }
      });

      if (!notification) {
        console.log('❌ Bildirim bulunamadı veya yetki yok');
        return res.status(404).json({ error: 'Bildirim bulunamadı' });
      }

      await prisma.notification.delete({
        where: { id: notificationId }
      });

      console.log('✅ Bildirim silindi:', notification.title);

      return res.json({
        success: true,
        message: 'Bildirim başarıyla silindi'
      });
    } catch (error) {
      console.error('❌ Bildirim silme hatası:', error);
      return res.status(500).json({ error: 'Bildirim silinemedi' });
    }
  }
}
