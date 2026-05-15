import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { notifications } from "@mantine/notifications";
import { useAuthContext } from "@/app/providers";
import { authService } from "../services";
import { LoginInput } from "@shared/schemas/auth.schema";

/**
 * Custom hook để xử lý login logic
 * Bao gồm validation, API call, state management, error handling
 */
export const useLogin = () => {
  const navigate = useNavigate();
  const { login } = useAuthContext();

  const loginMutation = useMutation({
    mutationFn: (data: LoginInput) => authService.login(data),
    onSuccess: (response) => {
      const { user, token } = response;

      // Update auth context
      login(
        {
          id: user.id.toString(),
          name: `${user.firstName} ${user.lastName}`,
          email: user.email,
          avatar: user.avatar,
          role: user.role,
        },
        token,
      );

      // Show success notification
      notifications.show({
        title: "Đăng nhập thành công",
        message: `Chào mừng ${user.firstName}!`,
        color: "green",
      });

      // Redirect based on role
      if (user.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/");
      }
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.error ||
        error.response?.data?.message ||
        error.message ||
        "Đăng nhập thất bại. Vui lòng thử lại.";

      notifications.show({
        title: "Lỗi đăng nhập",
        message,
        color: "red",
      });
    },
  });

  const handleLogin = useCallback(
    (credentials: LoginInput) => {
      loginMutation.mutate(credentials);
    },
    [loginMutation],
  );

  return {
    login: handleLogin,
    ...loginMutation,
  };
};
