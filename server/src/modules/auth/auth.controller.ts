import { Request, Response } from "express";
import { z } from "zod";
import * as authService from "@/modules/auth/auth.service";

const registerSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(6, "Mật khẩu tối thiểu 6 ký tự"),
  firstName: z.string().min(1, "Tên là bắt buộc"),
  lastName: z.string().min(1, "Họ là bắt buộc"),
});

const verifyOtpSchema = z.object({
  userId: z.number().int("User ID phải là số"),
  otpCode: z.string().length(6, "Mã OTP phải có 6 chữ số"),
});

const loginSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(1, "Mật khẩu là bắt buộc"),
});

const resetPasswordSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
  otpCode: z.string().length(6, "Mã OTP phải có 6 chữ số"),
  newPassword: z.string().min(6, "Mật khẩu tối thiểu 6 ký tự"),
});

export const register = async (req: Request, res: Response) => {
  try {
    console.log("[REGISTER_CONTROLLER] Received registration request:", {
      email: req.body.email,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
    });

    // Validation
    const data = registerSchema.parse(req.body);

    // Call service
    const result = await authService.register(
      data.email,
      data.password,
      data.firstName,
      data.lastName,
    );

    console.log("[REGISTER_CONTROLLER] Registration successful:", {
      userId: result.userId,
      email: result.email,
    });

    res.status(201).json({
      success: true,
      message: result.message,
      data: {
        userId: result.userId,
        email: result.email,
      },
    });
  } catch (error: any) {
    console.error("[REGISTER_CONTROLLER] Registration error:", {
      message: error.message,
      code: error.code,
      stack: error.stack,
    });

    if (error instanceof z.ZodError) {
      console.error("[REGISTER_CONTROLLER] Validation errors:", error.errors);
      return res.status(400).json({
        success: false,
        error: "Dữ liệu không hợp lệ",
        details: error.errors,
      });
    }

    res.status(400).json({
      success: false,
      error: error.message || "Lỗi đăng ký",
    });
  }
};

export const verifyRegisterOtp = async (req: Request, res: Response) => {
  try {
    console.log("[VERIFY_OTP_CONTROLLER] Received OTP verification request:", {
      userId: req.body.userId,
      otpCode: req.body.otpCode,
    });

    // Validation
    const data = verifyOtpSchema.parse(req.body);

    // Call service
    const result = await authService.verifyRegisterOtp(
      data.userId,
      data.otpCode,
    );

    console.log("[VERIFY_OTP_CONTROLLER] OTP verification successful for user ID:", data.userId);

    res.json({
      success: true,
      message: result.message,
      user: result.user,
    });
  } catch (error: any) {
    console.error("[VERIFY_OTP_CONTROLLER] OTP verification error:", {
      userId: req.body.userId,
      message: error.message,
      stack: error.stack,
    });

    if (error instanceof z.ZodError) {
      console.error("[VERIFY_OTP_CONTROLLER] Validation errors:", error.errors);
      return res.status(400).json({
        success: false,
        error: "Dữ liệu không hợp lệ",
        details: error.errors,
      });
    }

    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

export const resendRegisterOtp = async (req: Request, res: Response) => {
  try {
    const { userId } = req.body;

    if (!userId || typeof userId !== "number") {
      return res.status(400).json({
        success: false,
        error: "User ID là bắt buộc",
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
};

export const login = async (req: Request, res: Response) => {
  try {
    console.log("[LOGIN_CONTROLLER] Received login request for email:", req.body.email);

    // Validation
    const data = loginSchema.parse(req.body);

    // Call service
    const result = await authService.login(data.email, data.password);

    console.log("[LOGIN_CONTROLLER] Login successful for user ID:", result.user.id);

    // Yêu cầu: trả về URL (user -> /user/profile, admin -> /admin/profile)
    const isUserAdmin = result.user.role === "ADMIN";

    res.json({
      success: true,
      user: result.user,
      token: result.token,
      redirectUrl: isUserAdmin ? "/admin/profile" : "/user/profile",
    });
  } catch (error: any) {
    console.error("[LOGIN_CONTROLLER] Login error:", {
      email: req.body.email,
      message: error.message,
      stack: error.stack,
    });

    if (error instanceof z.ZodError) {
      console.error("[LOGIN_CONTROLLER] Validation errors:", error.errors);
      return res.status(400).json({
        success: false,
        error: "Dữ liệu không hợp lệ",
        details: error.errors,
      });
    }

    res.status(401).json({
      success: false,
      error: error.message,
    });
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email || typeof email !== "string") {
      return res.status(400).json({
        success: false,
        error: "Email là bắt buộc",
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
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    // Validation
    const data = resetPasswordSchema.parse(req.body);

    // Call service
    const result = await authService.resetPasswordWithOtp(
      data.email,
      data.otpCode,
      data.newPassword,
    );

    res.json({
      success: true,
      message: result.message,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: "Dữ liệu không hợp lệ",
        details: error.errors,
      });
    }

    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

export const verifyToken = async (req: Request, res: Response) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        error: "Token là bắt buộc",
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
};

export const refreshToken = async (req: Request, res: Response) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        error: "Token là bắt buộc",
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
};

export const logout = (req: Request, res: Response) => {
  res.json({
    success: true,
    message: "Đã đăng xuất thành công",
  });
};
