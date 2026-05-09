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
      // Xóa token nếu hết hạn
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;
