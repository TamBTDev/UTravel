import axios, { AxiosInstance } from 'axios';

/**
 * Instance axios được cấu hình sẵn cho API calls
 */
export const apiClient: AxiosInstance = axios.create({
  baseURL: (import.meta as any).env.VITE_API_URL || (import.meta as any).env.VITE_API_BASE_URL || 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Thêm token vào header nếu có
 */
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * Xử lý response error
 */
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Bỏ qua interceptor tự động văng ra ngoài đối với request đăng nhập
      if (error.config && error.config.url && error.config.url.includes('/auth/login')) {
        return Promise.reject(error);
      }

      // Xóa token nếu hết hạn
      localStorage.removeItem('token');
      localStorage.removeItem('user');

      // Chỉ redirect nếu không phải đang ở trang login
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
