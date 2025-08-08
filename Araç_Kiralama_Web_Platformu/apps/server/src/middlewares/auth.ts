import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/database';

export interface AuthRequest extends Request {
  user?: {
    id: string;
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
    console.log('🔍 Auth middleware çalışıyor...');
    
    const authHeader = req.headers.authorization;
    console.log('🔍 Authorization header:', authHeader);
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Yetkilendirme token\'ı gerekli',
      });
    }

    const token = authHeader.substring(7);
    console.log('🔍 Token alındı:', token.substring(0, 20) + '...');
    
    // Clerk JWT token'ını decode et (doğrulama yapmadan)
    let decoded: any;
    try {
      decoded = jwt.decode(token);
    } catch (decodeError) {
      console.error('❌ Token decode hatası:', decodeError);
      return res.status(401).json({
        error: 'Geçersiz token formatı',
      });
    }
    
    if (!decoded || !decoded.sub) {
      console.error('❌ Token içeriği geçersiz:', decoded);
      return res.status(401).json({
        error: 'Geçersiz token içeriği',
      });
    }

    console.log('🔍 Decoded token:', {
      sub: decoded.sub,
      email: decoded.email,
      exp: decoded.exp
    });
    
    console.log('🔍 Tüm token içeriği:', JSON.stringify(decoded, null, 2));
    console.log('🔍 Aranan clerkId:', decoded.sub);
    console.log('🔍 Aranan email:', decoded.email);

    // Email'i token'dan al
    let userEmail = decoded.email;
    
    // Eğer token'da email yoksa, alternatif alanları kontrol et
    if (!userEmail) {
      if (decoded.email_addresses && decoded.email_addresses.length > 0) {
        userEmail = decoded.email_addresses[0].email_address;
      } else if (decoded.primary_email_address) {
        userEmail = decoded.primary_email_address.email_address;
      }
    }
    
    console.log('🔍 Token\'dan alınan email:', userEmail);
    
    // Kullanıcıyı veritabanından clerkId ile bul
    let user = await prisma.user.findUnique({
      where: { clerkId: decoded.sub },
      select: {
        id: true,
        email: true,
        role: true,
        isActive: true,
      },
    });

    // Kullanıcı yoksa otomatik oluştur
    if (!user) {
      console.log('🔍 Kullanıcı bulunamadı, oluşturuluyor...');
      console.log('🔍 Oluşturulacak kullanıcı bilgileri:');
      console.log('  - clerkId:', decoded.sub);
      console.log('  - email:', userEmail);
      
      // Email yoksa geçici email oluştur (daha sonra güncellenebilir)
      if (!userEmail) {
        console.warn('⚠️ Token\'da email bulunamadı, geçici email oluşturuluyor...');
        userEmail = `temp_${decoded.sub}@rentify.com`;
      }
      
      try {
        user = await prisma.user.create({
          data: {
            clerkId: decoded.sub,
            email: userEmail,
            firstName: decoded.given_name || decoded.name?.split(' ')[0] || 'Kullanıcı',
            lastName: decoded.family_name || decoded.name?.split(' ').slice(1).join(' ') || 'Adı',
            role: 'USER',
            isActive: true,
          },
          select: {
            id: true,
            email: true,
            role: true,
            isActive: true,
          },
        });
        
        console.log('✅ Yeni kullanıcı oluşturuldu:', user.email);
      } catch (createError) {
        console.error('❌ Kullanıcı oluşturma hatası:', createError);
        return res.status(500).json({
          error: 'Kullanıcı oluşturulamadı',
        });
      }
    }

    if (!user.isActive) {
      return res.status(401).json({
        error: 'Kullanıcı aktif değil',
      });
    }

    req.user = user;
    console.log('🔍 Kullanıcı doğrulandı:', user.email);
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

  // Admin kontrolü - email ile
  if (req.user.email !== 'admin@rentify.com') {
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
    
    const decoded = jwt.decode(token) as any;

    if (decoded && decoded.sub) {
      // Email'i token'dan al
      let userEmail = decoded.email;
      
      // Eğer token'da email yoksa, alternatif alanları kontrol et
      if (!userEmail) {
        if (decoded.email_addresses && decoded.email_addresses.length > 0) {
          userEmail = decoded.email_addresses[0].email_address;
        } else if (decoded.primary_email_address) {
          userEmail = decoded.primary_email_address.email_address;
        }
      }
      
      let user = await prisma.user.findUnique({
        where: { clerkId: decoded.sub },
        select: {
          id: true,
          email: true,
          role: true,
          isActive: true,
        },
      });

      // Kullanıcı yoksa oluştur
      if (!user && userEmail) {
        try {
          user = await prisma.user.create({
            data: {
              clerkId: decoded.sub,
              email: userEmail,
              firstName: decoded.given_name || decoded.name?.split(' ')[0] || 'Kullanıcı',
              lastName: decoded.family_name || decoded.name?.split(' ').slice(1).join(' ') || 'Adı',
              role: 'USER',
              isActive: true,
            },
            select: {
              id: true,
              email: true,
              role: true,
              isActive: true,
            },
          });
        } catch (createError) {
          console.error('Optional auth - kullanıcı oluşturma hatası:', createError);
        }
      }

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

export { authenticateUser as authMiddleware }; 