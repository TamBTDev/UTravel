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
        message: `Chào mừng ${user.firstName || user.email}!`,
        color: "green",
        autoClose: 3000,
      });

      // Redirect based on role
      setTimeout(() => {
        if (user.role === USER_ROLES.ADMIN) {
          navigate("/admin");
        } else {
          navigate("/");
        }
      }, 500);
    }
  }, [isAuthenticated, user, navigate]);

  // Xử lý thông báo lỗi
  useEffect(() => {
    if (error) {
      let errorMessage = error;
      
      // Provide user-friendly error messages
      if (error.includes("không tồn tại")) {
        errorMessage = "Email hoặc mật khẩu không đúng";
      } else if (error.includes("chưa được kích hoạt")) {
        errorMessage = "Tài khoản chưa được kích hoạt. Vui lòng xác thực email.";
      } else if (error.includes("bị khóa")) {
        errorMessage = "Tài khoản bị khóa. Liên hệ quản trị viên.";
      }

      notifications.show({
        title: "Lỗi đăng nhập",
        message: errorMessage,
        color: "red",
        autoClose: 5000,
      });
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const handleLogin = useCallback(
    (credentials: LoginInput) => {
      if (!credentials.email || !credentials.password) {
        notifications.show({
          title: "Thiếu thông tin",
          message: "Vui lòng nhập email và mật khẩu",
          color: "red",
        });
        return;
      }
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
