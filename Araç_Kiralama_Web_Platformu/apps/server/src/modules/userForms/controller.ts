import { Request, Response } from 'express';
import { prisma } from '../../config/database';
import { AuthRequest } from '../../middlewares/auth';

export class UserFormController {
  // Kullanıcının formlarını getir
  async getUserForms(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ error: 'Kullanıcı kimliği gerekli' });
      }

      const forms = await prisma.userForm.findMany({
        where: { userId },
        include: {
          booking: {
            include: {
              vehicle: true
            }
          }
        },
        orderBy: { submittedAt: 'desc' }
      });

      return res.json({
        success: true,
        data: forms
      });
    } catch (error) {
      console.error('Form getirme hatası:', error);
      return res.status(500).json({ error: 'Formlar getirilemedi' });
    }
  }

  // Tüm formları getir (admin için)
  async getAllForms(req: AuthRequest, res: Response) {
    try {
      const forms = await prisma.userForm.findMany({
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              phone: true
            }
          },
          booking: {
            include: {
              vehicle: true
            }
          }
        },
        orderBy: { submittedAt: 'desc' }
      });

      return res.json({
        success: true,
        data: forms
      });
    } catch (error) {
      console.error('Form getirme hatası:', error);
      return res.status(500).json({ error: 'Formlar getirilemedi' });
    }
  }

  // Form oluştur
  async createForm(req: AuthRequest, res: Response) {
    try {
      console.log('🔍 createForm çağrıldı');
      console.log('🔍 Request body:', req.body);
      console.log('🔍 User:', req.user);
      
      const userId = req.user?.id;
      const { bookingId, ...formData } = req.body;

      console.log('🔍 userId:', userId);
      console.log('🔍 bookingId:', bookingId);
      console.log('🔍 formData:', formData);

      if (!userId) {
        console.log('❌ Kullanıcı kimliği yok');
        return res.status(401).json({ error: 'Kullanıcı kimliği gerekli' });
      }

      if (!bookingId) {
        console.log('❌ Kiralama ID yok');
        return res.status(400).json({ error: 'Kiralama ID gerekli' });
      }

      // Kiralama var mı kontrol et
      const booking = await prisma.booking.findUnique({
        where: { id: bookingId, userId }
      });

      if (!booking) {
        return res.status(404).json({ error: 'Kiralama bulunamadı' });
      }

      // Form zaten var mı kontrol et
      const existingForm = await prisma.userForm.findFirst({
        where: { bookingId, userId }
      });

      if (existingForm) {
        return res.status(400).json({ error: 'Bu kiralama için form zaten mevcut' });
      }

      // Tarih formatını düzelt
      const formattedFormData = {
        ...formData,
        licenseExpiry: formData.licenseExpiry ? new Date(formData.licenseExpiry) : null
      };

      console.log('🔍 Formatted formData:', formattedFormData);

      // Form oluştur
      const form = await prisma.userForm.create({
        data: {
          userId,
          bookingId,
          ...formattedFormData
        },
        include: {
          booking: {
            include: {
              vehicle: true
            }
          }
        }
      });

      // Kiralama durumunu güncelle
      await prisma.booking.update({
        where: { id: bookingId },
        data: { status: 'FORM_PENDING' }
      });

      // Form gönderildi notification'ı oluştur
      try {
        await prisma.notification.create({
          data: {
            userId: userId,
            type: 'FORM_SUBMITTED',
            title: 'Form Başarıyla Gönderildi',
            message: `Form bilgileriniz başarıyla gönderildi. Admin tarafından incelendikten sonra size bilgi verilecek.`,
            isRead: false,
            data: JSON.stringify({
              formId: form.id,
              bookingId: bookingId
            })
          }
        });
        console.log('✅ Form gönderildi notification oluşturuldu');
      } catch (notificationError) {
        console.error('❌ Notification oluşturma hatası:', notificationError);
      }

      return res.status(201).json({
        success: true,
        data: form,
        message: 'Form başarıyla gönderildi'
      });
    } catch (error) {
      console.error('Form oluşturma hatası:', error);
      return res.status(500).json({ error: 'Form oluşturulamadı' });
    }
  }

  // Form onayla/reddet
  async updateFormStatus(req: AuthRequest, res: Response) {
    try {
      const { formId } = req.params;
      const { isApproved, isRejected, rejectionReason } = req.body;

      const form = await prisma.userForm.findUnique({
        where: { id: formId },
        include: {
          booking: true
        }
      });

      if (!form) {
        return res.status(404).json({ error: 'Form bulunamadı' });
      }

      // Form durumunu güncelle
      const updatedForm = await prisma.userForm.update({
        where: { id: formId },
        data: {
          isApproved: isApproved || false,
          isRejected: isRejected || false,
          rejectionReason: rejectionReason || null,
          approvedAt: isApproved ? new Date() : null,
          approvedBy: isApproved ? req.user?.id : null
        }
      });

      // Kiralama durumunu güncelle
      if (isApproved) {
        await prisma.booking.update({
          where: { id: form.bookingId },
          data: { status: 'CONFIRMED' }
        });
      } else if (isRejected) {
        await prisma.booking.update({
          where: { id: form.bookingId },
          data: { status: 'CANCELLED' }
        });
      }

      return res.json({
        success: true,
        data: updatedForm,
        message: isApproved ? 'Form onaylandı' : 'Form reddedildi'
      });
    } catch (error) {
      console.error('Form durum güncelleme hatası:', error);
      return res.status(500).json({ error: 'Form durumu güncellenemedi' });
    }
  }

  // Form detayını getir
  async getFormById(req: AuthRequest, res: Response) {
    try {
      const { formId } = req.params;
      const userId = req.user?.id;

      const form = await prisma.userForm.findUnique({
        where: { id: formId },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              phone: true
            }
          },
          booking: {
            include: {
              vehicle: true
            }
          }
        }
      });

      if (!form) {
        return res.status(404).json({ error: 'Form bulunamadı' });
      }

      // Kullanıcı sadece kendi formunu görebilir (admin hariç)
      if (form.userId !== userId && req.user?.role !== 'ADMIN') {
        return res.status(403).json({ error: 'Bu forma erişim izniniz yok' });
      }

      return res.json({
        success: true,
        data: form
      });
    } catch (error) {
      console.error('Form detay getirme hatası:', error);
      return res.status(500).json({ error: 'Form detayı getirilemedi' });
    }
  }
}

