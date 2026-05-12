import { apiClient } from '../../../lib/axios';
import { LoginInput, RegisterInput } from '@shared/schemas/auth.schema';

export interface LoginResponse {
  success: boolean;
  user: {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
    avatar?: string;
    role: 'user' | 'admin';
  };
  token: string;
}

/**
 * Auth API Service
 * Xử lý các API calls liên quan đến authentication
 */
export const authService = {
  /**
   * Đăng nhập với email và mật khẩu
   */
  login: async (credentials: LoginInput): Promise<LoginResponse> => {
    try {
      const response = await apiClient.post<LoginResponse>(
        '/auth/login',
        credentials
      );
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  },

  /**
   * Đăng xuất
   */
  logout: async (): Promise<void> => {
    try {
      await apiClient.post('/auth/logout');
    } catch (error: any) {
      throw error.response?.data || error;
    }
  },

  /**
   * Lấy thông tin user hiện tại
   */
  getCurrentUser: async () => {
    try {
      const response = await apiClient.get('/auth/me');
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  },

  refreshToken: async (): Promise<{ token: string }> => {
    try {
      const response = await apiClient.post('/auth/refresh');
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  },

  /**
   * Đăng ký tài khoản mới
   */
  register: async (data: RegisterInput): Promise<{ data: { userId: number; email: string }; message: string }> => {
    try {
      const response = await apiClient.post('/auth/register', data);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  },

  /**
   * Xác thực OTP
   */
  verifyOtp: async (data: { userId: number; otpCode: string }): Promise<{ user: any; message: string }> => {
    try {
      const response = await apiClient.post('/auth/register/verify-otp', data);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  },

  /**
   * Gửi lại mã OTP
   */
  resendOtp: async (userId: number): Promise<{ message: string }> => {
    try {
      const response = await apiClient.post('/auth/register/resend-otp', { userId });
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  },

  forgotPassword: async (email: string): Promise<{ message: string }> => {
    try {
      const response = await apiClient.post('/auth/forgot-password', { email });
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  },

  resetPassword: async (data: {
    email: string;
    otpCode: string;
    newPassword: string;
  }): Promise<{ message: string }> => {
    try {
      const response = await apiClient.post('/auth/reset-password', data);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  },
};
