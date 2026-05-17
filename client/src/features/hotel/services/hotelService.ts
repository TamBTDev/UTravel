import apiClient from "@/lib/api-client";

// ========== INTERFACES ==========

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
  reviews?: any[];
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

// ========== HOTEL SERVICE ==========

export const hotelService = {
  // Get all hotels
  getHotels: async (
    params?: GetHotelsParams
  ): Promise<GetHotelsResponse> => {
    const response = await apiClient.get("/hotels", { params });
    return response.data;
  },

  // Featured hotels
  getFeaturedHotels: async (
    limit: number = 6
  ): Promise<{ success: boolean; data: Hotel[] }> => {
    const response = await apiClient.get("/hotels/featured", {
      params: { limit },
    });

    return response.data;
  },

  // Destinations
  getDestinations: async (
    limit: number = 4
  ): Promise<{ success: boolean; data: Destination[] }> => {
    const response = await apiClient.get("/hotels/destinations", {
      params: { limit },
    });

    return response.data;
  },

  // Hotel detail
  getHotelDetail: async (id: string): Promise<Hotel> => {
    const response = await apiClient.get(`/hotels/${id}`);
    return response.data.data;
  },

  // Related hotels
  getRelatedHotels: async (
    id: string,
    limit: number = 4
  ): Promise<Hotel[]> => {
    const response = await apiClient.get(`/hotels/${id}/related`, {
      params: { limit },
    });

    return response.data.data;
  },

  // Check room availability
  checkRoomAvailability: async (
    roomId: string,
    checkInDate: string,
    checkOutDate: string
  ): Promise<{ available: boolean }> => {
    const response = await apiClient.get(
      `/rooms/${roomId}/availability`,
      {
        params: {
          checkInDate,
          checkOutDate,
        },
      }
    );

    return response.data.data;
  },

  // Room detail
  getRoomDetail: async (roomId: string): Promise<any> => {
    const response = await apiClient.get(`/rooms/${roomId}`);
    return response.data.data;
  },
};

// ========== DIRECT EXPORTS ==========

export const getHotels = hotelService.getHotels;
export const getFeaturedHotels = hotelService.getFeaturedHotels;
export const getDestinations = hotelService.getDestinations;

export const getHotelDetail = hotelService.getHotelDetail;
export const getRelatedHotels = hotelService.getRelatedHotels;
export const checkRoomAvailability =
  hotelService.checkRoomAvailability;
export const getRoomDetail = hotelService.getRoomDetail;