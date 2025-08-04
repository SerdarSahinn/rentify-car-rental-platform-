import { Request, Response, NextFunction } from 'express';

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let error = { ...err };
  error.message = err.message;

  // Log error
  console.error('Error:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
  });

  // Prisma error handling
  if (err.name === 'PrismaClientKnownRequestError') {
    const message = 'Veritabanı işlemi başarısız';
    error = { message, statusCode: 400 } as AppError;
  }

  // Prisma validation error
  if (err.name === 'PrismaClientValidationError') {
    const message = 'Geçersiz veri formatı';
    error = { message, statusCode: 400 } as AppError;
  }

  // JWT error
  if (err.name === 'JsonWebTokenError') {
    const message = 'Geçersiz token';
    error = { message, statusCode: 401 } as AppError;
  }

  // JWT expired
  if (err.name === 'TokenExpiredError') {
    const message = 'Token süresi dolmuş';
    error = { message, statusCode: 401 } as AppError;
  }

  // Cast error (MongoDB/ObjectId)
  if (err.name === 'CastError') {
    const message = 'Geçersiz ID formatı';
    error = { message, statusCode: 400 } as AppError;
  }

  // Duplicate key error
  if (err.name === 'MongoError' && (err as any).code === 11000) {
    const message = 'Bu kayıt zaten mevcut';
    error = { message, statusCode: 400 } as AppError;
  }

  // Validation error
  if (err.name === 'ValidationError') {
    const message = Object.values((err as any).errors)
      .map((val: any) => val.message)
      .join(', ');
    error = { message, statusCode: 400 } as AppError;
  }

  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || 'Sunucu hatası',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

export const notFound = (req: Request, res: Response, next: NextFunction) => {
  const error = new Error(`Sayfa bulunamadı - ${req.originalUrl}`) as AppError;
  error.statusCode = 404;
  next(error);
};

export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}; 