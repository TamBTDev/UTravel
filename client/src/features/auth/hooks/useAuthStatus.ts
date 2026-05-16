import { useEffect } from "react";
import { useAppSelector } from "@/hooks/useAppStore";
import { useNavigate } from "react-router-dom";

/**
 * Hook check auth status và quản lý redirect dùng Redux
 */
export const useAuthStatus = (redirectTo?: string) => {
  const { user, isAuthenticated, isLoading } = useAppSelector(
    (state) => state.auth,
  );
  const navigate = useNavigate();

  useEffect(() => {
    // Nếu đã đăng nhập và có redirectTo, thì redirect
    if (!isLoading && isAuthenticated && redirectTo) {
      navigate(redirectTo);
    }
  }, [isLoading, isAuthenticated, redirectTo, navigate]);

  return {
    user,
    isAuthenticated,
    isLoading,
  };
};
