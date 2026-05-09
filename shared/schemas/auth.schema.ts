/**
 * Schema xác thực người dùng
 * 
 * Chứa các schema cho:
 * - Đăng nhập (login)
 * - Đăng ký (register)
 */
import { z } from 'zod';

// Schema cho đăng nhập
export const loginSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
});

// Schema cho đăng ký - mở rộng từ loginSchema với thêm thông tin cá nhân
export const registerSchema = loginSchema.extend({
  firstName: z.string().min(1, 'Tên là bắt buộc'),
  lastName: z.string().min(1, 'Họ là bắt buộc'),
  confirmPassword: z.string(),
}).refine((data: any) => data.password === data.confirmPassword, {
  message: "Mật khẩu không khớp",
  path: ['confirmPassword'],
});

// Kiểu dữ liệu cho đầu vào đăng nhập
export type LoginInput = z.infer<typeof loginSchema>;
// Kiểu dữ liệu cho đầu vào đăng ký
export type RegisterInput = z.infer<typeof registerSchema>;
