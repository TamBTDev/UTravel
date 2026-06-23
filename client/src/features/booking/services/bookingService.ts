import apiClient from "@/lib/api-client";

export interface CreateBookingData {
  roomId: string;
  checkInDate: string;
  checkOutDate: string;
  adults?: number;
  children?: number;
  specialNote?: string;
  promotionCode?: string;
  usePoints?: number;
}

export const createBooking = async (data: CreateBookingData) => {
  const response = await apiClient.post('/bookings', data);
  return response.data.data;
};

export const validatePromotion = async (code: string, hotelId?: string | number) => {
  const params = new URLSearchParams({ code });
  if (hotelId) params.append('hotelId', hotelId.toString());
  const response = await apiClient.get(`/bookings/validate-promo?${params.toString()}`);
  return response.data.data;
};

export const getMyBookings = async () => {
  const response = await apiClient.get('/bookings');
  return response.data.data;
};

export const getBookingDetail = async (bookingId: string) => {
  const response = await apiClient.get(`/bookings/${bookingId}`);
  return response.data.data;
};

export const cancelBooking = async (bookingId: string | number) => {
  const response = await apiClient.patch(`/bookings/${bookingId}`, { status: 'CANCELLED' });
  return response.data;
};

export const createPayment = async (data: { bookingId: string | number; method: 'CASH' | 'BANK_TRANSFER' | 'WALLET', useWallet?: boolean }) => {
  const response = await apiClient.post('/payments', data);
  return response.data;
};

export const getPaymentByBooking = async (bookingId: string | number) => {
  const response = await apiClient.get(`/payments/booking/${bookingId}`);
  return response.data.data;
};

export const getPaymentStatus = async (paymentId: string | number) => {
  const response = await apiClient.get(`/payments/${paymentId}`);
  return response.data.data;
};

export const getUserWalletBalance = async () => {
  const response = await apiClient.get('/payments/wallet/balance');
  return response.data.data as { balance: number; hasWallet: boolean };
};

export const completeBookingAction = async (bookingId: string | number) => {
  const response = await apiClient.patch(`/bookings/${bookingId}/complete`);
  return response.data;
};
