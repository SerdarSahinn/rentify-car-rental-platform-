import { Request, Response } from 'express';
import { ReviewService } from './service';
import { CreateReviewDto, CreateReplyDto } from './dto';

const reviewService = new ReviewService();

export class ReviewController {
  // Araç için tüm yorumları getir (public)
  async getVehicleReviews(req: Request, res: Response) {
    try {
      const { vehicleId } = req.params;
      
      if (!vehicleId) {
        return res.status(400).json({
          success: false,
          error: 'Araç ID gerekli'
        });
      }

      const reviews = await reviewService.getVehicleReviews(vehicleId);
      
      return res.status(200).json({
        success: true,
        data: reviews
      });
    } catch (error: any) {
      console.error('Review getirme hatası:', error);
      return res.status(500).json({
        success: false,
        error: error.message || 'Yorumlar getirilemedi'
      });
    }
  }

  // Yeni yorum ekle (authenticated)
  async createReview(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Giriş yapmanız gerekiyor'
        });
      }

      const reviewData: CreateReviewDto = req.body;
      
      // Validation
      if (!reviewData.vehicleId || !reviewData.rating || !reviewData.comment) {
        return res.status(400).json({
          success: false,
          error: 'Tüm alanlar gerekli'
        });
      }

      if (reviewData.rating < 1 || reviewData.rating > 5) {
        return res.status(400).json({
          success: false,
          error: 'Rating 1-5 arasında olmalıdır'
        });
      }

      const review = await reviewService.createReview(userId, reviewData);
      
      return res.status(201).json({
        success: true,
        data: review
      });
    } catch (error: any) {
      console.error('Review oluşturma hatası:', error);
      return res.status(400).json({
        success: false,
        error: error.message || 'Yorum eklenemedi'
      });
    }
  }

  // Yorum sil (admin only)
  async deleteReview(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      const userRole = (req as any).user?.role;
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Giriş yapmanız gerekiyor'
        });
      }

      if (userRole !== 'ADMIN') {
        return res.status(403).json({
          success: false,
          error: 'Bu işlem için yetkiniz yok'
        });
      }

      const { reviewId } = req.params;
      
      if (!reviewId) {
        return res.status(400).json({
          success: false,
          error: 'Review ID gerekli'
        });
      }

      await reviewService.deleteReview(reviewId);
      
      return res.status(200).json({
        success: true,
        message: 'Yorum başarıyla silindi'
      });
    } catch (error: any) {
      console.error('Review silme hatası:', error);
      return res.status(400).json({
        success: false,
        error: error.message || 'Yorum silinemedi'
      });
    }
  }

  // Tüm yorumları getir (admin only)
  async getAllReviews(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      const userRole = (req as any).user?.role;
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Giriş yapmanız gerekiyor'
        });
      }

      if (userRole !== 'ADMIN') {
        return res.status(403).json({
          success: false,
          error: 'Bu işlem için yetkiniz yok'
        });
      }

      const reviews = await reviewService.getAllReviews();
      
      return res.status(200).json({
        success: true,
        data: reviews
      });
    } catch (error: any) {
      console.error('Tüm yorumları getirme hatası:', error);
      return res.status(500).json({
        success: false,
        error: error.message || 'Yorumlar getirilemedi'
      });
    }
  }

  // Reply sistemi metodları

  // Yanıt ekle (authenticated)
  async createReply(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Giriş yapmanız gerekiyor'
        });
      }

      const replyData: CreateReplyDto = req.body;
      
      // Validation
      if (!replyData.reviewId || !replyData.content) {
        return res.status(400).json({
          success: false,
          error: 'Review ID ve yanıt metni gerekli'
        });
      }

      if (replyData.content.trim().length < 3) {
        return res.status(400).json({
          success: false,
          error: 'Yanıt en az 3 karakter olmalıdır'
        });
      }

      const reply = await reviewService.createReply(userId, replyData);
      
      return res.status(201).json({
        success: true,
        data: reply
      });
    } catch (error: any) {
      console.error('Yanıt oluşturma hatası:', error);
      return res.status(400).json({
        success: false,
        error: error.message || 'Yanıt eklenemedi'
      });
    }
  }

  // Yanıt sil (admin only)
  async deleteReply(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      const userRole = (req as any).user?.role;
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Giriş yapmanız gerekiyor'
        });
      }

      if (userRole !== 'ADMIN') {
        return res.status(403).json({
          success: false,
          error: 'Bu işlem için yetkiniz yok'
        });
      }

      const { replyId } = req.params;
      
      if (!replyId) {
        return res.status(400).json({
          success: false,
          error: 'Reply ID gerekli'
        });
      }

      await reviewService.deleteReply(replyId);
      
      return res.status(200).json({
        success: true,
        message: 'Yanıt başarıyla silindi'
      });
    } catch (error: any) {
      console.error('Yanıt silme hatası:', error);
      return res.status(400).json({
        success: false,
        error: error.message || 'Yanıt silinemedi'
      });
    }
  }

  // Yorum için tüm yanıtları getir (public)
  async getRepliesForReview(req: Request, res: Response) {
    try {
      const { reviewId } = req.params;
      
      if (!reviewId) {
        return res.status(400).json({
          success: false,
          error: 'Review ID gerekli'
        });
      }

      const replies = await reviewService.getRepliesForReview(reviewId);
      
      return res.status(200).json({
        success: true,
        data: replies
      });
    } catch (error: any) {
      console.error('Yanıtları getirme hatası:', error);
      return res.status(500).json({
        success: false,
        error: error.message || 'Yanıtlar getirilemedi'
      });
    }
  }
}

