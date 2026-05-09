import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import env from '../config/env';

declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

/**
 * Authentication Middleware
 * Xác thực JWT token từ header Authorization
 */
export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized - Token không tìm thấy',
    });
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      error: 'Token không hợp lệ hoặc đã hết hạn',
    });
  }
};

/**
 * Role-Based Authorization Middleware
 * Kiểm tra quyền của người dùng
 *
 * Ví dụ sử dụng:
 * router.get('/admin/dashboard', authMiddleware, requireRole('ADMIN'), (req, res) => {...})
 * router.get('/profile', authMiddleware, requireRole('USER', 'ADMIN'), (req, res) => {...})
 */
export const requireRole = (...allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized - Vui lòng xác thực',
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden - Bạn không có quyền truy cập tài nguyên này',
      });
    }

    next();
  };
};
