import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/database';

// Clerk API'den kullanıcı bilgisi çekmek için yardımcı fonksiyon
async function fetchClerkUserEmail(clerkId: string): Promise<string | undefined> {
  try {
    const clerkSecretKey = process.env.CLERK_SECRET_KEY;
    if (!clerkSecretKey) return undefined;

    // Node 18+ içerisinde fetch yerleşik olarak bulunur
    const response = await fetch(`https://api.clerk.dev/v1/users/${clerkId}`, {
      headers: {
        Authorization: `Bearer ${clerkSecretKey}`,
      },
    });

    if (!response.ok) return undefined;
    const data: any = await response.json();
    const emailFromClerk: string | undefined = data?.primary_email_address?.email_address
      || data?.email_addresses?.[0]?.email_address;
    return emailFromClerk;
  } catch (_err) {
    return undefined;
  }
}

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

// Admin yetkisi kontrolü
export const requireAdmin = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'Kimlik doğrulama gerekli',
    });
  }

  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({
      success: false,
      error: 'Bu işlem için admin yetkisi gerekli',
    });
  }

  return next();
};

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

    // Email'i token'dan al (yoksa Clerk API'den denenecek)
    let userEmail = decoded.email as string | undefined;
    
    // Eğer token'da email yoksa, alternatif alanları kontrol et
    if (!userEmail) {
      if (decoded.email_addresses && decoded.email_addresses.length > 0) {
        userEmail = decoded.email_addresses[0].email_address;
      } else if (decoded.primary_email_address) {
        userEmail = decoded.primary_email_address.email_address;
      }
    }
    
    console.log('🔍 Token\'dan alınan email:', userEmail);

    // Token'da email yoksa Clerk API'den çekmeyi dene
    if (!userEmail) {
      const emailFromClerk = await fetchClerkUserEmail(decoded.sub);
      if (emailFromClerk) {
        userEmail = emailFromClerk;
        console.log('🔍 Clerk API\'den alınan email:', userEmail);
      }
    }
    
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

    // Kullanıcı yoksa, önce email ile kontrol et
    if (!user && userEmail) {
      console.log('🔍 ClerkID ile kullanıcı bulunamadı, email ile kontrol ediliyor...');
      
      // Email ile kullanıcı ara
      const existingUserByEmail = await prisma.user.findUnique({
        where: { email: userEmail },
        select: {
          id: true,
          email: true,
          role: true,
          isActive: true,
          clerkId: true,
        },
      });

      if (existingUserByEmail) {
        console.log('🔍 Email ile kullanıcı bulundu, ClerkID güncellenecek...');
        console.log('  - Eski ClerkID:', existingUserByEmail.clerkId);
        console.log('  - Yeni ClerkID:', decoded.sub);
        
        // ClerkID'yi güncelle
        user = await prisma.user.update({
          where: { id: existingUserByEmail.id },
          data: { clerkId: decoded.sub },
          select: {
            id: true,
            email: true,
            role: true,
            isActive: true,
          },
        });
        
        console.log('✅ ClerkID güncellendi:', user.email);
      } else {
        // Gerçekten yeni kullanıcı oluştur
        console.log('🔍 Tamamen yeni kullanıcı oluşturuluyor...');
        console.log('🔍 Oluşturulacak kullanıcı bilgileri:');
        console.log('  - clerkId:', decoded.sub);
        console.log('  - email:', userEmail);
        
        try {
          user = await prisma.user.create({
            data: {
              clerkId: decoded.sub,
              email: userEmail,
              firstName: decoded.given_name || decoded.name?.split(' ')[0] || 'Kullanıcı',
              lastName: decoded.family_name || decoded.name?.split(' ').slice(1).join(' ') || 'Adı',
              // Tek admin kuralı: yalnızca admin@rentify.com ADMIN olabilir
              role: userEmail === 'admin@rentify.com' ? 'ADMIN' : 'USER',
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
    } else if (!user) {
      // Email de yoksa geçici email ile oluştur
      console.log('🔍 Email bulunamadı, geçici kullanıcı oluşturuluyor...');
      userEmail = `temp_${decoded.sub}@rentify.com`;
      
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
        
        console.log('✅ Geçici kullanıcı oluşturuldu:', user.email);
      } catch (createError) {
        console.error('❌ Geçici kullanıcı oluşturma hatası:', createError);
        return res.status(500).json({
          error: 'Kullanıcı oluşturulamadı',
        });
      }
    }

    // Tek admin kuralını login anında uygula
    if (user.email === 'admin@rentify.com' && user.role !== 'ADMIN') {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { role: 'ADMIN' },
        select: { id: true, email: true, role: true, isActive: true },
      });
      console.log('👑 Tek admin kuralı uygulandı: admin@rentify.com ADMIN yapıldı');
    } else if (user.email !== 'admin@rentify.com' && user.role === 'ADMIN') {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { role: 'USER' },
        select: { id: true, email: true, role: true, isActive: true },
      });
      console.log('🔒 Tek admin kuralı uygulandı: ADMIN olmayan email indirildi -> USER');
    }

    if (!user.isActive) {
      return res.status(401).json({
        error: 'Kullanıcı aktif değil',
      });
    }

    req.user = user;
    console.log('🔍 Kullanıcı doğrulandı:', user.email);
    console.log('🎯 KULLANICI DETAYI:', {
      email: user.email,
      role: user.role,
      adminMi: user.role === 'ADMIN' ? 'EVET' : 'HAYIR'
    });
    return next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(401).json({
      error: 'Kimlik doğrulama hatası',
    });
  }
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