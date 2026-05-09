import { Router, Request, Response } from 'express';
import { authService } from '@/services/auth.service';
import { rateLimitConfig } from '@/middlewares/rateLimit.middleware';
import { z } from 'zod';

/**
 * Auth Routes
 * Các endpoint để đăng ký, đăng nhập, xác thực OTP, quên mật khẩu
 */

const authRouter = Router();

// ============================================
// VALIDATION SCHEMAS
// ============================================

const registerSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(6, 'Mật khẩu tối thiểu 6 ký tự'),
  firstName: z.string().min(1, 'Tên là bắt buộc'),
  lastName: z.string().min(1, 'Họ là bắt buộc'),
});

const verifyOtpSchema = z.object({
  userId: z.number().int('User ID phải là số'),
  otpCode: z.string().length(6, 'Mã OTP phải có 6 chữ số'),
});

const loginSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(1, 'Mật khẩu là bắt buộc'),
});

const resetPasswordSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
  otpCode: z.string().length(6, 'Mã OTP phải có 6 chữ số'),
  newPassword: z.string().min(6, 'Mật khẩu tối thiểu 6 ký tự'),
});

// ============================================
// ENDPOINTS
// ============================================

/**
 * POST /api/auth/register
 * Đăng ký tài khoản mới và gửi OTP
 *
 * Body:
 * - email: string
 * - password: string (min 6 ký tự)
 * - firstName: string
 * - lastName: string
 *
 * Response:
 * - success: boolean
 * - message: string
 * - userId: number
 * - email: string
 */
authRouter.post('/register', rateLimitConfig.register, async (req: Request, res: Response) => {
  try {
    // Validation
    const data = registerSchema.parse(req.body);

    // Call service
    const result = await authService.register(data.email, data.password, data.firstName, data.lastName);

    res.status(201).json({
      success: true,
      message: result.message,
      data: {
        userId: result.userId,
        email: result.email,
      },
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Dữ liệu không hợp lệ',
        details: error.errors,
      });
    }

    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/auth/register/verify-otp
 * Xác thực OTP và kích hoạt tài khoản
 *
 * Body:
 * - userId: number
 * - otpCode: string (6 chữ số)
 *
 * Response:
 * - success: boolean
 * - message: string
 * - user: { id, email, status }
 */
authRouter.post('/register/verify-otp', rateLimitConfig.verifyOtp, async (req: Request, res: Response) => {
  try {
    // Validation
    const data = verifyOtpSchema.parse(req.body);

    // Call service
    const result = await authService.verifyRegisterOtp(data.userId, data.otpCode);

    res.json({
      success: true,
      message: result.message,
      user: result.user,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Dữ liệu không hợp lệ',
        details: error.errors,
      });
    }

    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/auth/register/resend-otp
 * Gửi lại mã OTP
 *
 * Body:
 * - userId: number
 *
 * Response:
 * - success: boolean
 * - message: string
 */
authRouter.post('/register/resend-otp', rateLimitConfig.sendOtp, async (req: Request, res: Response) => {
  try {
    const { userId } = req.body;

    if (!userId || typeof userId !== 'number') {
      return res.status(400).json({
        success: false,
        error: 'User ID là bắt buộc',
      });
    }

    const result = await authService.resendRegisterOtp(userId);

    res.json({
      success: true,
      message: result.message,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/auth/login
 * Đăng nhập với email và mật khẩu
 *
 * Body:
 * - email: string
 * - password: string
 *
 * Response:
 * - success: boolean
 * - user: { id, email, firstName, lastName, role, avatar }
 * - token: string (JWT)
 */
authRouter.post('/login', rateLimitConfig.login, async (req: Request, res: Response) => {
  try {
    // Validation
    const data = loginSchema.parse(req.body);

    // Call service
    const result = await authService.login(data.email, data.password);

    res.json({
      success: true,
      user: result.user,
      token: result.token,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Dữ liệu không hợp lệ',
        details: error.errors,
      });
    }

    res.status(401).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/auth/forgot-password
 * Gửi mã OTP để đặt lại mật khẩu
 *
 * Body:
 * - email: string
 *
 * Response:
 * - success: boolean
 * - message: string
 */
authRouter.post('/forgot-password', rateLimitConfig.sendOtp, async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email || typeof email !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Email là bắt buộc',
      });
    }

    const result = await authService.sendResetPasswordOtp(email);

    res.json({
      success: true,
      message: result.message,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/auth/reset-password
 * Đặt lại mật khẩu sau khi xác thực OTP
 *
 * Body:
 * - email: string
 * - otpCode: string (6 chữ số)
 * - newPassword: string (min 6 ký tự)
 *
 * Response:
 * - success: boolean
 * - message: string
 */
authRouter.post('/reset-password', rateLimitConfig.verifyOtp, async (req: Request, res: Response) => {
  try {
    // Validation
    const data = resetPasswordSchema.parse(req.body);

    // Call service
    const result = await authService.resetPasswordWithOtp(data.email, data.otpCode, data.newPassword);

    res.json({
      success: true,
      message: result.message,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Dữ liệu không hợp lệ',
        details: error.errors,
      });
    }

    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/auth/verify-token
 * Xác thực token JWT (cho frontend)
 *
 * Body:
 * - token: string
 *
 * Response:
 * - success: boolean
 * - decoded: { id, email, role, iat, exp }
 */
authRouter.post('/verify-token', async (req: Request, res: Response) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        error: 'Token là bắt buộc',
      });
    }

    const decoded = await authService.verifyToken(token);

    res.json({
      success: true,
      decoded,
    });
  } catch (error: any) {
    res.status(401).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/auth/refresh-token
 * Làm mới JWT Token
 *
 * Body:
 * - token: string (old token)
 *
 * Response:
 * - success: boolean
 * - token: string (new token)
 */
authRouter.post('/refresh-token', async (req: Request, res: Response) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        error: 'Token là bắt buộc',
      });
    }

    const result = await authService.refreshToken(token);

    res.json({
      success: true,
      token: result.token,
    });
  } catch (error: any) {
    res.status(401).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/auth/logout
 * Logout (thực chất không cần, JWT không đòi hỏi server-side logout)
 */
authRouter.post('/logout', (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Đã đăng xuất thành công',
  });
});

export default authRouter;
