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
      notifications.show({
        title: "Đăng ký thành công",
        message: "Vui lòng kiểm tra email để nhận mã OTP.",
        color: "green",
      });

      // Chuyển sang trang xác thực OTP
      navigate("/verify-otp", { state: { userId: tempUserId } });
    }
  }, [tempUserId, navigate]);

  useEffect(() => {
    if (error) {
      notifications.show({
        title: "Lỗi đăng ký",
        message: error,
        color: "red",
      });
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const handleRegister = useCallback(
    (data: RegisterInput) => {
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
