import { useEffect } from 'react';
import { useAuthContext } from '../../../app/providers';

/**
 * Hook để check auth status và quản lý redirect
 */
export const useAuthStatus = (redirectTo?: string) => {
  const { user, isAuthenticated, isLoading } = useAuthContext();

  useEffect(() => {
    // Nếu đã đăng nhập và có redirectTo, thì redirect
    if (!isLoading && isAuthenticated && redirectTo) {
      window.location.href = redirectTo;
    }
  }, [isLoading, isAuthenticated, redirectTo]);

  return {
    user,
    isAuthenticated,
    isLoading,
  };
};
