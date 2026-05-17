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

export const updateBooking = async (bookingId: string, status: string) => {
  const response = await apiClient.patch(`/bookings/${bookingId}`, { status });
  return response.data.data;
};

export const cancelBooking = async (bookingId: string) => {
  return updateBooking(bookingId, 'cancelled');
};

export const createPayment = async (data: { bookingId: string; method: string }) => {
  const response = await apiClient.post('/payments', data);
  return response.data.data;
};

export const getPaymentStatus = async (paymentId: string) => {
  const response = await apiClient.get(`/payments/${paymentId}`);
  return response.data.data;
};
