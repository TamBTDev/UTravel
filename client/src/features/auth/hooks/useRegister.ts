import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import { authService } from '../services';
import { RegisterInput } from '@shared/schemas/auth.schema';

export const useRegister = () => {
  const navigate = useNavigate();

  const registerMutation = useMutation({
    mutationFn: (data: RegisterInput) => authService.register(data),
    onSuccess: (response, variables) => {
      const { message, data } = response as any;
      
      notifications.show({
        title: 'Đăng ký thành công',
        message: message || 'Vui lòng kiểm tra email để nhận mã OTP.',
        color: 'green',
      });

      // Redirect to OTP verification with email and userId
      navigate('/verify-otp', { state: { email: data?.email || variables.email, userId: data?.userId } });
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.error ||
        error.message ||
        'Đăng ký thất bại. Vui lòng thử lại.';

      notifications.show({
        title: 'Lỗi đăng ký',
        message,
        color: 'red',
      });
    },
  });

  const handleRegister = useCallback(
    (data: RegisterInput) => {
      registerMutation.mutate(data);
    },
    [registerMutation]
  );

  return {
    register: handleRegister,
    ...registerMutation,
  };
};
