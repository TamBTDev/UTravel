import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { Center, Loader } from "@mantine/core";
import { useAppSelector } from "@/hooks/useAppStore";
import { USER_ROLES } from "@shared/constants/roles";

type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: UserRole;
}

export const ProtectedRoute = ({
  children,
  requiredRole,
}: ProtectedRouteProps) => {
  const { user, isLoading, isAuthenticated } = useAppSelector(
    (state) => state.auth,
  );

  if (isLoading) {
    return (
      <Center h="100vh">
        <Loader />
      </Center>
    );
  }

  // Chưa đăng nhập
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Kiểm tra quyền hạn
  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};
