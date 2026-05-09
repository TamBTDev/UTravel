import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import { authService } from '../services';

export const useVerifyOtp = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as { email: string; userId: number } | undefined;
  
  const [email] = useState(state?.email || '');
  const [userId] = useState(state?.userId || 0);

  const verifyMutation = useMutation({
    mutationFn: (otpCode: string) => authService.verifyOtp({ userId, otpCode }),
    onSuccess: (response) => {
      notifications.show({
        title: 'Xác thực thành công',
        message: response.message || 'Tài khoản của bạn đã được kích hoạt. Vui lòng đăng nhập.',
        color: 'green',
      });
      navigate('/login');
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.error ||
        error.message ||
        'Mã OTP không hợp lệ hoặc đã hết hạn.';

      notifications.show({
        title: 'Lỗi xác thực',
        message,
        color: 'red',
      });
    },
  });

  const resendMutation = useMutation({
    mutationFn: () => authService.resendOtp(userId),
    onSuccess: (response) => {
      notifications.show({
        title: 'Thành công',
        message: response.message || 'Mã OTP mới đã được gửi.',
        color: 'green',
      });
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.error ||
        error.message ||
        'Không thể gửi lại mã OTP.';

      notifications.show({
        title: 'Lỗi',
        message,
        color: 'red',
      });
    },
  });

  return {
    email,
    userId,
    verifyOtp: verifyMutation.mutate,
    isVerifying: verifyMutation.isPending,
    resendOtp: resendMutation.mutate,
    isResending: resendMutation.isPending,
  };
};
