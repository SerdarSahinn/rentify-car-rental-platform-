import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { authenticateUser, requireAdmin, optionalAuth, AuthRequest } from '../src/middlewares/auth';

// Mock dependencies
jest.mock('jsonwebtoken');
jest.mock('../src/config/database', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    }
  }
}));

const mockJwt = jwt as jest.Mocked<typeof jwt>;
const mockPrisma = require('../src/config/database').prisma;

describe('Auth Middleware', () => {
  let mockReq: Partial<AuthRequest>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockReq = {
      headers: {},
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  describe('authenticateUser', () => {
    it('geçerli token ile kullanıcı doğrulamalı', async () => {
      // Arrange
      const validToken = 'valid-jwt-token';
      const decodedToken = {
        sub: 'clerk-user-123',
        email: 'user@test.com',
        given_name: 'John',
        family_name: 'Doe'
      };
      const mockUser = {
        id: 'user-123',
        email: 'user@test.com',
        role: 'USER',
        isActive: true
      };

      mockReq.headers = {
        authorization: `Bearer ${validToken}`
      };

      mockJwt.decode.mockReturnValue(decodedToken);
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);

      // Act
      await authenticateUser(mockReq as AuthRequest, mockRes as Response, mockNext);

      // Assert
      expect(mockJwt.decode).toHaveBeenCalledWith(validToken);
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { clerkId: 'clerk-user-123' },
        select: {
          id: true,
          email: true,
          role: true,
          isActive: true,
        },
      });
      expect(mockReq.user).toEqual(mockUser);
      expect(mockNext).toHaveBeenCalled();
    });

    it('authorization header olmadığında 401 dönmeli', async () => {
      // Arrange - authorization header yok

      // Act
      await authenticateUser(mockReq as AuthRequest, mockRes as Response, mockNext);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Yetkilendirme token\'ı gerekli',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('geçersiz token formatında 401 dönmeli', async () => {
      // Arrange
      mockReq.headers = {
        authorization: 'InvalidFormat token'
      };

      // Act
      await authenticateUser(mockReq as AuthRequest, mockRes as Response, mockNext);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Yetkilendirme token\'ı gerekli',
      });
    });

    it('token decode edilemediğinde 401 dönmeli', async () => {
      // Arrange
      const invalidToken = 'invalid-token';
      mockReq.headers = {
        authorization: `Bearer ${invalidToken}`
      };

      mockJwt.decode.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      // Act
      await authenticateUser(mockReq as AuthRequest, mockRes as Response, mockNext);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Geçersiz token formatı',
      });
    });

    it('kullanıcı yoksa otomatik oluşturmalı', async () => {
      // Arrange
      const validToken = 'valid-jwt-token';
      const decodedToken = {
        sub: 'clerk-new-user-123',
        email: 'newuser@test.com',
        given_name: 'Jane',
        family_name: 'Smith'
      };
      const newUser = {
        id: 'new-user-123',
        email: 'newuser@test.com',
        role: 'USER',
        isActive: true
      };

      mockReq.headers = {
        authorization: `Bearer ${validToken}`
      };

      mockJwt.decode.mockReturnValue(decodedToken);
      mockPrisma.user.findUnique.mockResolvedValue(null); // Kullanıcı yok
      mockPrisma.user.create.mockResolvedValue(newUser); // Yeni kullanıcı oluştur

      // Act
      await authenticateUser(mockReq as AuthRequest, mockRes as Response, mockNext);

      // Assert
      expect(mockPrisma.user.create).toHaveBeenCalledWith({
        data: {
          clerkId: 'clerk-new-user-123',
          email: 'newuser@test.com',
          firstName: 'Jane',
          lastName: 'Smith',
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
      expect(mockReq.user).toEqual(newUser);
      expect(mockNext).toHaveBeenCalled();
    });

    it('aktif olmayan kullanıcı için 401 dönmeli', async () => {
      // Arrange
      const validToken = 'valid-jwt-token';
      const decodedToken = {
        sub: 'clerk-user-123',
        email: 'user@test.com'
      };
      const inactiveUser = {
        id: 'user-123',
        email: 'user@test.com',
        role: 'USER',
        isActive: false // Aktif değil
      };

      mockReq.headers = {
        authorization: `Bearer ${validToken}`
      };

      mockJwt.decode.mockReturnValue(decodedToken);
      mockPrisma.user.findUnique.mockResolvedValue(inactiveUser);

      // Act
      await authenticateUser(mockReq as AuthRequest, mockRes as Response, mockNext);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Kullanıcı aktif değil',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('requireAdmin', () => {
    it('admin kullanıcı için geçişe izin vermeli', () => {
      // Arrange
      mockReq.user = {
        id: 'admin-123',
        email: 'admin@rentify.com',
        role: 'ADMIN'
      };

      // Act
      requireAdmin(mockReq as AuthRequest, mockRes as Response, mockNext);

      // Assert
      expect(mockNext).toHaveBeenCalled();
    });

    it('admin olmayan kullanıcı için 403 dönmeli', () => {
      // Arrange
      mockReq.user = {
        id: 'user-123',
        email: 'user@test.com',
        role: 'USER'
      };

      // Act
      requireAdmin(mockReq as AuthRequest, mockRes as Response, mockNext);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Admin yetkisi gerekli',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('kullanıcı bilgisi olmadığında 401 dönmeli', () => {
      // Arrange - req.user yok

      // Act
      requireAdmin(mockReq as AuthRequest, mockRes as Response, mockNext);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Kimlik doğrulama gerekli',
      });
    });
  });

  describe('optionalAuth', () => {
    it('token olmadığında normal devam etmeli', async () => {
      // Arrange - authorization header yok

      // Act
      await optionalAuth(mockReq as AuthRequest, mockRes as Response, mockNext);

      // Assert
      expect(mockNext).toHaveBeenCalled();
      expect(mockReq.user).toBeUndefined();
    });

    it('geçerli token ile kullanıcı bilgisi eklemeli', async () => {
      // Arrange
      const validToken = 'valid-jwt-token';
      const decodedToken = {
        sub: 'clerk-user-123',
        email: 'user@test.com'
      };
      const mockUser = {
        id: 'user-123',
        email: 'user@test.com',
        role: 'USER',
        isActive: true
      };

      mockReq.headers = {
        authorization: `Bearer ${validToken}`
      };

      mockJwt.decode.mockReturnValue(decodedToken);
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);

      // Act
      await optionalAuth(mockReq as AuthRequest, mockRes as Response, mockNext);

      // Assert
      expect(mockReq.user).toEqual(mockUser);
      expect(mockNext).toHaveBeenCalled();
    });

    it('hata durumunda normal devam etmeli', async () => {
      // Arrange
      const invalidToken = 'invalid-token';
      mockReq.headers = {
        authorization: `Bearer ${invalidToken}`
      };

      mockJwt.decode.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      // Act
      await optionalAuth(mockReq as AuthRequest, mockRes as Response, mockNext);

      // Assert
      expect(mockNext).toHaveBeenCalled();
      expect(mockReq.user).toBeUndefined();
    });
  });
});
