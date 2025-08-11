import { PrismaClient } from '@prisma/client';
import { CreateReviewDto, ReviewResponseDto, AdminReviewResponseDto, CreateReplyDto, ReplyResponseDto } from './dto';

const prisma = new PrismaClient();

export class ReviewService {
  // Araç için tüm yorumları getir
  async getVehicleReviews(vehicleId: string): Promise<ReviewResponseDto[]> {
    try {
      const reviews = await prisma.review.findMany({
        where: {
          vehicleId,
          isApproved: true
        },
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
              avatar: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      return reviews.map(review => ({
        id: review.id,
        userId: review.userId,
        vehicleId: review.vehicleId,
        rating: review.rating,
        comment: review.comment,
        createdAt: review.createdAt.toISOString(),
        updatedAt: review.updatedAt.toISOString(),
        user: {
          firstName: review.user.firstName,
          lastName: review.user.lastName,
          avatar: review.user.avatar
        }
      }));
    } catch (error) {
      console.error('Review getirme hatası:', error);
      throw new Error('Yorumlar getirilemedi');
    }
  }

  // Yeni yorum ekle
  async createReview(userId: string, reviewData: CreateReviewDto): Promise<ReviewResponseDto> {
    try {
      // Kullanıcının bu araç için daha önce yorum yapıp yapmadığını kontrol et
      const existingReview = await prisma.review.findFirst({
        where: {
          userId,
          vehicleId: reviewData.vehicleId
        }
      });

      if (existingReview) {
        throw new Error('Bu araç için zaten yorum yapmışsınız');
      }

      // Rating'i 1-5 arasında kontrol et
      if (reviewData.rating < 1 || reviewData.rating > 5) {
        throw new Error('Rating 1-5 arasında olmalıdır');
      }

      // Yorumu oluştur
      const review = await prisma.review.create({
        data: {
          userId,
          vehicleId: reviewData.vehicleId,
          rating: reviewData.rating,
          comment: reviewData.comment,
          isApproved: true // Otomatik onay (admin onay sistemi yok)
        },
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
              avatar: true
            }
          }
        }
      });

      // Araç rating'ini güncelle
      await this.updateVehicleRating(reviewData.vehicleId);

      return {
        id: review.id,
        userId: review.userId,
        vehicleId: review.vehicleId,
        rating: review.rating,
        comment: review.comment,
        createdAt: review.createdAt.toISOString(),
        updatedAt: review.updatedAt.toISOString(),
        user: {
          firstName: review.user.firstName,
          lastName: review.user.lastName,
          avatar: review.user.avatar
        }
      };
    } catch (error) {
      console.error('Review oluşturma hatası:', error);
      throw error;
    }
  }

  // Yorum sil (admin için)
  async deleteReview(reviewId: string): Promise<void> {
    try {
      const review = await prisma.review.findUnique({
        where: { id: reviewId },
        include: { vehicle: true }
      });

      if (!review) {
        throw new Error('Yorum bulunamadı');
      }

      // Yorumu sil
      await prisma.review.delete({
        where: { id: reviewId }
      });

      // Araç rating'ini güncelle
      await this.updateVehicleRating(review.vehicleId);
    } catch (error) {
      console.error('Review silme hatası:', error);
      throw new Error('Yorum silinemedi');
    }
  }

  // Tüm yorumları getir (admin için)
  async getAllReviews(): Promise<AdminReviewResponseDto[]> {
    try {
      const reviews = await prisma.review.findMany({
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
              email: true
            }
          },
          vehicle: {
            select: {
              brand: true,
              model: true,
              year: true
            }
          },
          replies: {
            where: { isApproved: true },
            include: {
              user: {
                select: {
                  firstName: true,
                  lastName: true,
                  avatar: true
                }
              }
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      return reviews.map(review => ({
        id: review.id,
        userId: review.userId,
        vehicleId: review.vehicleId,
        rating: review.rating,
        comment: review.comment,
        createdAt: review.createdAt.toISOString(),
        updatedAt: review.updatedAt.toISOString(),
        user: {
          firstName: review.user.firstName,
          lastName: review.user.lastName,
          email: review.user.email
        },
        vehicle: {
          brand: review.vehicle.brand,
          model: review.vehicle.model,
          year: review.vehicle.year
        },
        replies: review.replies.map(reply => ({
          id: reply.id,
          userId: reply.userId,
          reviewId: reply.reviewId,
          parentReplyId: reply.parentReplyId,
          content: reply.content,
          createdAt: reply.createdAt.toISOString(),
          updatedAt: reply.updatedAt.toISOString(),
          user: {
            firstName: reply.user.firstName,
            lastName: reply.user.lastName,
            avatar: reply.user.avatar
          }
        }))
      }));
    } catch (error) {
      console.error('Tüm yorumları getirme hatası:', error);
      throw new Error('Yorumlar getirilemedi');
    }
  }

  // Reply sistemi metodları

  // Yanıt ekle
  async createReply(userId: string, replyData: CreateReplyDto): Promise<ReplyResponseDto> {
    try {
      // Aynı kullanıcıdan aynı içerikle yanıt var mı kontrol et (son 5 dakika)
      const existingReply = await prisma.reply.findFirst({
        where: {
          userId,
          reviewId: replyData.reviewId,
          content: replyData.content,
          createdAt: {
            gte: new Date(Date.now() - 5 * 60 * 1000)
          }
        }
      });

      if (existingReply) {
        throw new Error('Aynı yanıt zaten eklenmiş');
      }

      // Review var mı kontrol et
      const review = await prisma.review.findUnique({
        where: { id: replyData.reviewId }
      });

      if (!review) {
        throw new Error('Review bulunamadı');
      }

      // Parent reply var mı kontrol et (eğer nested reply ise)
      if (replyData.parentReplyId) {
        const parentReply = await prisma.reply.findUnique({
          where: { id: replyData.parentReplyId }
        });

        if (!parentReply) {
          throw new Error('Parent reply bulunamadı');
        }
      }

      const reply = await prisma.reply.create({
        data: {
          userId,
          reviewId: replyData.reviewId,
          parentReplyId: replyData.parentReplyId,
          content: replyData.content,
          isApproved: true
        },
        include: {
          user: { select: { firstName: true, lastName: true, avatar: true } }
        }
      });

      return {
        id: reply.id,
        userId: reply.userId,
        reviewId: reply.reviewId,
        parentReplyId: reply.parentReplyId,
        content: reply.content,
        createdAt: reply.createdAt.toISOString(),
        updatedAt: reply.updatedAt.toISOString(),
        user: {
          firstName: reply.user.firstName,
          lastName: reply.user.lastName,
          avatar: reply.user.avatar
        }
      };
    } catch (error) {
      console.error('Yanıt oluşturma hatası:', error);
      throw error;
    }
  }

  // Yanıt sil (admin için)
  async deleteReply(replyId: string): Promise<void> {
    try {
      const reply = await prisma.reply.findUnique({
        where: { id: replyId }
      });

      if (!reply) {
        throw new Error('Yanıt bulunamadı');
      }

      // Yanıtı sil
      await prisma.reply.delete({
        where: { id: replyId }
      });
    } catch (error) {
      console.error('Yanıt silme hatası:', error);
      throw new Error('Yanıt silinemedi');
    }
  }

  // Yorum için tüm yanıtları getir
  async getRepliesForReview(reviewId: string): Promise<ReplyResponseDto[]> {
    try {
      const replies = await prisma.reply.findMany({
        where: {
          reviewId,
          isApproved: true,
          parentReplyId: null // Sadece ana yanıtlar
        },
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
              avatar: true
            }
          },
          replies: {
            where: { isApproved: true },
            include: {
              user: {
                select: {
                  firstName: true,
                  lastName: true,
                  avatar: true
                }
              }
            }
          }
        },
        orderBy: {
          createdAt: 'asc'
        }
      });

      return replies.map(reply => ({
        id: reply.id,
        userId: reply.userId,
        reviewId: reply.reviewId,
        parentReplyId: reply.parentReplyId,
        content: reply.content,
        createdAt: reply.createdAt.toISOString(),
        updatedAt: reply.updatedAt.toISOString(),
        user: {
          firstName: reply.user.firstName,
          lastName: reply.user.lastName,
          avatar: reply.user.avatar
        },
        replies: reply.replies.map(nestedReply => ({
          id: nestedReply.id,
          userId: nestedReply.userId,
          reviewId: nestedReply.reviewId,
          parentReplyId: nestedReply.parentReplyId,
          content: nestedReply.content,
          createdAt: nestedReply.createdAt.toISOString(),
          updatedAt: nestedReply.updatedAt.toISOString(),
          user: {
            firstName: nestedReply.user.firstName,
            lastName: nestedReply.user.lastName,
            avatar: nestedReply.user.avatar
          }
        }))
      }));
    } catch (error) {
      console.error('Yanıtları getirme hatası:', error);
      throw new Error('Yanıtlar getirilemedi');
    }
  }

  // Araç rating'ini güncelle
  private async updateVehicleRating(vehicleId: string): Promise<void> {
    try {
      const reviews = await prisma.review.findMany({
        where: {
          vehicleId,
          isApproved: true
        }
      });

      if (reviews.length === 0) {
        await prisma.vehicle.update({
          where: { id: vehicleId },
          data: {
            averageRating: 0,
            totalReviews: 0
          }
        });
        return;
      }

      const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
      const averageRating = totalRating / reviews.length;

      await prisma.vehicle.update({
        where: { id: vehicleId },
        data: {
          averageRating: Math.round(averageRating * 10) / 10, // 1 ondalık basamak
          totalReviews: reviews.length
        }
      });
    } catch (error) {
      console.error('Araç rating güncelleme hatası:', error);
    }
  }
}

