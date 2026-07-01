import { apiClient } from "@/lib/axios";

export interface RegisterVendorPayload {
  shopName: string;
  description?: string;
  businessLicense?: string;
  bankName: string;
  bankOwner: string;
  bankAccount: string;
}

export interface VendorProfile {
  id: number;
  userId: number;
  shopName: string;
  description: string | null;
  businessLicense: string | null;
  bankName: string;
  bankOwner: string;
  bankAccount: string;
  logo: string | null;
  status: "PENDING" | "APPROVED" | "REJECTED" | "SUSPENDED";
  commissionRate: number;
  createdAt: string;
  updatedAt: string;
  wallet?: {
    id: number;
    balance: number;
  };
}

export interface VendorDashboardStats {
  walletBalance: number;
  availableRooms: number;
  newBookingsCount: number;
  averageRating: number;
  recentBookings: any[];
  revenueData: { name: string; revenue: number }[];
}

export interface VendorHotel {
  id: number;
  name: string;
  description: string | null;
  location: string;
  city: string;
  rating: number;
  images: string;
  amenities: string;
  approvalStatus: "PENDING" | "APPROVED" | "REJECTED" | "DRAFT";
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count: {
    rooms: number;
    reviews: number;
  };
}

export interface CreateHotelPayload {
  name: string;
  description: string;
  address: string;
  city: string;
  stars: number;
  latitude?: number;
  longitude?: number;
  images?: string[];
  amenities?: string[];
}

export interface UpdateHotelPayload {
  name?: string;
  description?: string;
  address?: string;
  city?: string;
  stars?: number;
  latitude?: number;
  longitude?: number;
  images?: string[];
  amenities?: string[];
  isActive?: boolean;
}

export interface VendorRoom {
  id: number;
  hotelId: number;
  roomNumber: string;
  type: string;
  price: number;
  capacity: number;
  description: string | null;
  amenities: string | null;
  images: string | null;
  isAvailable: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRoomPayload {
  roomNumber: string;
  type: string;
  price: number;
  capacity: number;
  description?: string;
  images?: string[];
  amenities?: string[];
}

export interface UpdateRoomPayload {
  roomNumber?: string;
  type?: string;
  price?: number;
  capacity?: number;
  description?: string;
  images?: string[];
  amenities?: string[];
  isAvailable?: boolean;
}

export interface VendorBooking {
  id: number;
  userId: number;
  roomId: number;
  checkInDate: string;
  checkOutDate: string;
  totalPrice: number;
  status: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED";
  createdAt: string;
  updatedAt: string;
  room: {
    roomNumber: string;
    type: string;
    hotel: {
      name: string;
    };
  };
  user: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  payment?: {
    method: string;
    status: string;
    amount: number;
  };
}

export interface WalletTransaction {
  id: number;
  walletId: number;
  bookingId: number | null;
  type: "BOOKING_INCOME" | "COMMISSION_FEE" | "WITHDRAWAL" | "REFUND" | "ADJUSTMENT";
  amount: number;
  description: string | null;
  createdAt: string;
  booking?: {
    id: number;
    checkInDate: string;
    checkOutDate: string;
    room: {
      hotel: {
        id: number;
        name: string;
      };
    };
  };
}

export interface VendorRevenueReport {
  walletBalance: number;
  totalRevenue: number;
  transactions: WalletTransaction[];
}

export interface VendorReview {
  id: number;
  userId: number;
  hotelId: number;
  bookingId: number | null;
  rating: number;
  comment: string | null;
  vendorReply: string | null;
  vendorReplyAt: string | null;
  createdAt: string;
  updatedAt: string;
  hotel: {
    name: string;
  };
  user: {
    firstName: string;
    lastName: string;
    avatar: string | null;
  };
}

export const vendorService = {
  registerVendor: async (payload: RegisterVendorPayload): Promise<{ success: boolean; message: string; data: VendorProfile }> => {
    try {
      const response = await apiClient.post("/vendors/register", payload);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  },

  getVendorProfile: async (): Promise<{ success: boolean; data: VendorProfile }> => {
    try {
      const response = await apiClient.get("/vendors/profile");
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  },

  updateVendorProfile: async (data: Partial<RegisterVendorPayload>): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await apiClient.patch("/vendors/profile", data);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  },

  getVendorBookings: async (): Promise<{ success: boolean; data: VendorBooking[] }> => {
    try {
      const response = await apiClient.get("/vendors/bookings");
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  },

  updateVendorBookingStatus: async (bookingId: number, status: string): Promise<{ success: boolean; message: string; data: any }> => {
    try {
      const response = await apiClient.patch(`/vendors/bookings/${bookingId}/status`, { status });
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  },

  getVendorRevenueReport: async (): Promise<{ success: boolean; data: VendorRevenueReport }> => {
    try {
      const response = await apiClient.get("/vendors/revenue-report");
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  },

  getVendorReviews: async (): Promise<{ success: boolean; data: VendorReview[] }> => {
    try {
      const response = await apiClient.get("/vendors/reviews");
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  },

  replyToReview: async (reviewId: number, reply: string): Promise<{ success: boolean; message: string; data: any }> => {
    try {
      const response = await apiClient.patch(`/vendors/reviews/${reviewId}/reply`, { reply });
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  },

  resetVendorProfile: async (): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await apiClient.delete("/vendors/profile/reset");
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  },

  getVendorDashboardStats: async (): Promise<{ success: boolean; data: VendorDashboardStats }> => {
    try {
      const response = await apiClient.get("/vendors/dashboard-stats");
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  },

  // Hotels
  getVendorHotels: async () => {
    const response = await apiClient.get("/vendors/hotels");
    return response.data.data;
  },
  createVendorHotel: async (data: any) => {
    const response = await apiClient.post("/vendors/hotels", data);
    return response.data;
  },
  updateVendorHotel: async (id: number, data: any) => {
    const response = await apiClient.patch(`/vendors/hotels/${id}`, data);
    return response.data;
  },
  deleteVendorHotel: async (id: number) => {
    const response = await apiClient.delete(`/vendors/hotels/${id}`);
    return response.data;
  },

  // Rooms
  getVendorRooms: async (hotelId: number) => {
    const response = await apiClient.get(`/vendors/hotels/${hotelId}/rooms`);
    return response.data.data;
  },
  createVendorRoom: async (hotelId: number, data: any) => {
    const response = await apiClient.post(`/vendors/hotels/${hotelId}/rooms`, data);
    return response.data;
  },
  updateVendorRoom: async (hotelId: number, roomId: number, data: any) => {
    const response = await apiClient.patch(`/vendors/hotels/${hotelId}/rooms/${roomId}`, data);
    return response.data;
  },
  deleteVendorRoom: async (hotelId: number, roomId: number) => {
    const response = await apiClient.delete(`/vendors/hotels/${hotelId}/rooms/${roomId}`);
    return response.data;
  },

  // Withdraw
  createWithdrawRequest: async (amount: number, note?: string) => {
    const response = await apiClient.post("/vendors/wallet/withdraw", { amount, note });
    return response.data;
  },
  getVendorWithdrawRequests: async () => {
    const response = await apiClient.get("/vendors/wallet/withdraws");
    return response.data.data;
  },

  // === KHUYẾN MÃI ===
  getVendorPromotions: async () => {
    const response = await apiClient.get("/vendors/promotions");
    return response.data;
  },

  createVendorPromotion: async (data: any) => {
    const response = await apiClient.post("/vendors/promotions", data);
    return response.data;
  },

  updateVendorPromotion: async (id: number, data: any) => {
    const response = await apiClient.put(`/vendors/promotions/${id}`, data);
    return response.data;
  },

  deleteVendorPromotion: async (id: number) => {
    const response = await apiClient.delete(`/vendors/promotions/${id}`);
    return response.data;
  },

  // === QUẢN LÝ PHÒNG ===
  getVendorHotelRooms: async (hotelId: number) => {
    const response = await apiClient.get(`/vendors/hotels/${hotelId}/rooms`);
    return response.data;
  },

  createVendorHotelRoom: async (hotelId: number, data: any) => {
    const response = await apiClient.post(`/vendors/hotels/${hotelId}/rooms`, data);
    return response.data;
  },

  updateVendorHotelRoom: async (hotelId: number, roomId: number, data: any) => {
    const response = await apiClient.put(`/vendors/hotels/${hotelId}/rooms/${roomId}`, data);
    return response.data;
  },

  deleteVendorHotelRoom: async (hotelId: number, roomId: number) => {
    const response = await apiClient.delete(`/vendors/hotels/${hotelId}/rooms/${roomId}`);
    return response.data;
  },
};
