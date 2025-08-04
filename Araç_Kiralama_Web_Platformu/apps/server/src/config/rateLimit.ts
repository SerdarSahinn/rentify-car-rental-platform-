import rateLimit from 'express-rate-limit';

export const generalLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 dakika
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'), // IP başına maksimum istek
  message: {
    error: 'Çok fazla istek gönderildi. Lütfen daha sonra tekrar deneyin.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 dakika
  max: 5, // IP başına maksimum 5 giriş denemesi
  message: {
    error: 'Çok fazla giriş denemesi. Lütfen 15 dakika sonra tekrar deneyin.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 dakika
  max: 1000, // API endpoint'leri için daha yüksek limit
  message: {
    error: 'API rate limit aşıldı. Lütfen daha sonra tekrar deneyin.',
  },
  standardHeaders: true,
  legacyHeaders: false,
}); 