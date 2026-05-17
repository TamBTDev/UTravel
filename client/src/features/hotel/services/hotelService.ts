import { apiClient } from "@/lib/axios";

export interface Hotel {
  id: number;
  name: string;
  description: string | null;
  location: string;
  city: string;
  country: string;
  rating: number;
  amenities: any;
  images: any;
  createdAt: string;
  updatedAt: string;
  rooms?: any[];
}

export interface GetHotelsParams {
  search?: string;
  city?: string;
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
  capacity?: number;
  checkIn?: string;
  checkOut?: string;
  sortBy?: string;
  page?: number;
  limit?: number;
}

export interface GetHotelsResponse {
  success: boolean;
  total: number;
  data: Hotel[];
  page: number;
  limit: number;
  totalPages: number;
}

export interface Destination {
  name: string;
  count: number;
  image: string;
}

export const hotelService = {
  getHotels: async (params?: GetHotelsParams): Promise<GetHotelsResponse> => {
    const response = await apiClient.get('/hotels', { params });
    return response.data;
  },

  getFeaturedHotels: async (limit: number = 6): Promise<{ success: boolean; data: Hotel[] }> => {
    const response = await apiClient.get('/hotels/featured', { params: { limit } });
    return response.data;
  },

  getDestinations: async (limit: number = 4): Promise<{ success: boolean; data: Destination[] }> => {
    const response = await apiClient.get('/hotels/destinations', { params: { limit } });
    return response.data;
  }
};
