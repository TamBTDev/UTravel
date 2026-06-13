import apiClient from "@/lib/api-client";

export interface CreateBookingData {
  roomId: string;
  checkInDate: string;
  checkOutDate: string;
  numberOfGuests: number;
  specialRequests?: string;
}

export const createBooking = async (data: CreateBookingData) => {
  const response = await apiClient.post('/bookings', data);
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

export const createPayment = async (data: { bookingId: string | number; method: 'CASH' | 'BANK_TRANSFER' }) => {
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
