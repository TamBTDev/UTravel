import axiosInstance from '@/lib/axios';

export interface CreateReviewData {
  hotelId: number;
  bookingId: number;
  rating: number;
  comment?: string;
  cleanlinessRating?: number;
  serviceRating?: number;
  locationRating?: number;
  valueRating?: number;
  highlights?: string[];
  images?: string[];
}

export const reviewService = {
  createReview: async (data: CreateReviewData) => {
    const response = await axiosInstance.post('/reviews', data);
    return response.data;
  },
  getHotelReviews: async (hotelId: number, page = 1, limit = 10) => {
    const response = await axiosInstance.get(`/reviews/hotel/${hotelId}?page=${page}&limit=${limit}`);
    return response.data;
  }
};
