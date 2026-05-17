import { useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { notifications } from "@mantine/notifications";
import { useAppDispatch, useAppSelector } from "@/hooks/useAppStore";
import { register, clearError } from "@/app/store/authSlice";
import { RegisterInput } from "@shared/schemas/auth.schema";

export const useRegister = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isLoading, error, tempUserId } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (tempUserId) {
      const email = sessionStorage.getItem("registerEmail");
      notifications.show({
        title: "Đăng ký thành công",
        message: `Mã OTP đã được gửi đến email ${email || 'của bạn'}. Kiểm tra email để lấy mã.`,
        color: "green",
        autoClose: 5000,
      });

      // Chuyển sang trang xác thực OTP
      navigate("/verify-otp", { state: { userId: tempUserId, email } });
    }
  }, [tempUserId, navigate]);

  useEffect(() => {
    if (error) {
      notifications.show({
        title: "Lỗi đăng ký",
        message: error,
        color: "red",
        autoClose: 5000,
      });
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const handleRegister = useCallback(
    (data: RegisterInput) => {
      // Save email for OTP verification
      sessionStorage.setItem("registerEmail", data.email);
      dispatch(register(data));
    },
    [dispatch],
  );

  return {
    register: handleRegister,
    isLoading,
    error,
  };
};
