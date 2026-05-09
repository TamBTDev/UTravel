import { Request, Response, NextFunction } from 'express';

/**
 * Rate Limiting Middleware
 * Chống lại Spam API và Brute-force attacks
 *
 * Lưu trữ: IP + Endpoint → Số lần gọi trong thời gian
 */

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const store: RateLimitStore = {};

export interface RateLimitOptions {
  windowMs: number; // Thời gian cửa sổ (ms) - mặc định 15 phút
  maxRequests: number; // Số lần gọi tối đa trong cửa sổ
  message?: string; // Thông báo lỗi
}

/**
 * Tạo Rate Limit middleware
 * @param options Cấu hình
 * @returns Middleware function
 */
export const createRateLimitMiddleware = (options: RateLimitOptions) => {
  const { windowMs = 15 * 60 * 1000, maxRequests = 5, message = 'Too many requests, please try again later.' } = options;

  return (req: Request, res: Response, next: NextFunction) => {
    const key = `${req.ip}:${req.path}`;
    const now = Date.now();

    // Kiểm tra xem khóa này có trong store không
    if (!store[key]) {
      store[key] = {
        count: 1,
        resetTime: now + windowMs,
      };
      return next();
    }

    // Nếu đã vượt quá thời gian cửa sổ, reset
    if (now > store[key].resetTime) {
      store[key] = {
        count: 1,
        resetTime: now + windowMs,
      };
      return next();
    }

    // Tăng số lần gọi
    store[key].count++;

    // Nếu vượt quá giới hạn
    if (store[key].count > maxRequests) {
      return res.status(429).json({
        success: false,
        error: message,
        retryAfter: Math.ceil((store[key].resetTime - now) / 1000),
      });
    }

    next();
  };
};

/**
 * Cấu hình Rate Limit cho từng endpoint
 */
export const rateLimitConfig = {
  // Đăng ký: 5 yêu cầu / 15 phút
  register: createRateLimitMiddleware({
    windowMs: 15 * 60 * 1000,
    maxRequests: 5,
    message: 'Quá nhiều yêu cầu đăng ký. Vui lòng thử lại sau 15 phút.',
  }),

  // Đăng nhập: 10 yêu cầu / 15 phút (chống Brute-force)
  login: createRateLimitMiddleware({
    windowMs: 15 * 60 * 1000,
    maxRequests: 10,
    message: 'Quá nhiều yêu cầu đăng nhập. Tài khoản bị khóa tạm thời 15 phút.',
  }),

  // Gửi OTP: 3 yêu cầu / 10 phút
  sendOtp: createRateLimitMiddleware({
    windowMs: 10 * 60 * 1000,
    maxRequests: 3,
    message: 'Quá nhiều yêu cầu gửi OTP. Vui lòng thử lại sau 10 phút.',
  }),

  // Verify OTP: 5 yêu cầu / 5 phút
  verifyOtp: createRateLimitMiddleware({
    windowMs: 5 * 60 * 1000,
    maxRequests: 5,
    message: 'Quá nhiều yêu cầu xác thực OTP. Vui lòng thử lại sau 5 phút.',
  }),
};
