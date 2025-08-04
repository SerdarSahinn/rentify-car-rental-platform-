import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '@clerk/backend';
import { prisma } from '../config/database';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    clerkId: string;
    email: string;
    role: string;
  };
}

export const authenticateUser = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Yetkilendirme token\'ı gerekli',
      });
    }

    const token = authHeader.substring(7);
    
    // Clerk token'ını doğrula
    const payload = await verifyToken(token, {
      secretKey: process.env.CLERK_SECRET_KEY!,
    });

    if (!payload) {
      return res.status(401).json({
        error: 'Geçersiz token',
      });
    }

    // Kullanıcıyı veritabanından bul
    const user = await prisma.user.findUnique({
      where: { clerkId: payload.sub },
      select: {
        id: true,
        clerkId: true,
        email: true,
        role: true,
        isActive: true,
      },
    });

    if (!user || !user.isActive) {
      return res.status(401).json({
        error: 'Kullanıcı bulunamadı veya aktif değil',
      });
    }

    req.user = user;
    return next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(401).json({
      error: 'Kimlik doğrulama hatası',
    });
  }
};

export const requireAdmin = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    return res.status(401).json({
      error: 'Kimlik doğrulama gerekli',
    });
  }

  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({
      error: 'Admin yetkisi gerekli',
    });
  }

  return next();
};

export const optionalAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(); // Kimlik doğrulama olmadan devam et
    }

    const token = authHeader.substring(7);
    
    const payload = await verifyToken(token, {
      secretKey: process.env.CLERK_SECRET_KEY!,
    });

    if (payload) {
      const user = await prisma.user.findUnique({
        where: { clerkId: payload.sub },
        select: {
          id: true,
          clerkId: true,
          email: true,
          role: true,
          isActive: true,
        },
      });

      if (user && user.isActive) {
        req.user = user;
      }
    }

    return next();
  } catch (error) {
    // Hata durumunda kimlik doğrulama olmadan devam et
    return next();
  }
}; 