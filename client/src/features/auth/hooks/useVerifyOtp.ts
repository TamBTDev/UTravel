import { useEffect, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { notifications } from "@mantine/notifications";
import { useAppDispatch, useAppSelector } from "@/hooks/useAppStore";
import { verifyOtp, resendOtp, clearError } from "@/app/store/authSlice";

export const useVerifyOtp = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const { isLoading, error, isAuthenticated } = useAppSelector((state) => state.auth);

  const state = location.state as { email: string; userId: number } | undefined;
  const userId = state?.userId || 0;
  const email = state?.email || "";

  useEffect(() => {
    if (isAuthenticated) {
      notifications.show({
        title: "Xác thực thành công",
        message: "Tài khoản của bạn đã được kích hoạt.",
        color: "green",
      });
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (error) {
      notifications.show({
        title: "Lỗi",
        message: error,
        color: "red",
      });
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const handleVerify = useCallback(
    (otpCode: string) => {
      dispatch(verifyOtp({ userId, otpCode }));
    },
    [dispatch, userId],
  );

  const handleResend = useCallback(() => {
    dispatch(resendOtp(userId)).then((result) => {
      if (resendOtp.fulfilled.match(result)) {
        notifications.show({
          title: "Thành công",
          message: "Mã OTP mới đã được gửi.",
          color: "green",
        });
      }
    });
  }, [dispatch, userId]);

  return {
    email,
    userId,
    verifyOtp: handleVerify,
    isVerifying: isLoading,
    resendOtp: handleResend,
    isResending: isLoading,
  };
};
