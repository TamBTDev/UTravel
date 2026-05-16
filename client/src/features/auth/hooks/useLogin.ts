import { useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { notifications } from "@mantine/notifications";
import { useAppDispatch, useAppSelector } from "@/hooks/useAppStore";
import { login, clearError } from "@/app/store/authSlice";
import { LoginInput } from "@shared/schemas/auth.schema";
import { USER_ROLES } from "@shared/constants/roles";

export const useLogin = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isLoading, error, isAuthenticated, user } = useAppSelector(
    (state) => state.auth,
  );

  // Xử lý thông báo và redirect khi isAuthenticated thay đổi
  useEffect(() => {
    if (isAuthenticated && user) {
      notifications.show({
        title: "Đăng nhập thành công",
        message: `Chào mừng ${user.firstName}!`,
        color: "green",
      });

      if (user.role === USER_ROLES.ADMIN) {
        navigate("/admin");
      } else {
        navigate("/");
      }
    }
  }, [isAuthenticated, user, navigate]);

  // Xử lý thông báo lỗi
  useEffect(() => {
    if (error) {
      notifications.show({
        title: "Lỗi đăng nhập",
        message: error,
        color: "red",
      });
      // Clear error sau khi đã hiển thị để tránh lặp lại
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const handleLogin = useCallback(
    (credentials: LoginInput) => {
      dispatch(login(credentials));
    },
    [dispatch],
  );

  return {
    login: handleLogin,
    isLoading,
    error,
  };
};
