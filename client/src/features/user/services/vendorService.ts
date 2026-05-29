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
  availableRooms: number;
  newBookingsCount: number;
  averageRating: number;
  recentBookings: any[];
  revenueData: { name: string; revenue: number }[];
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
};
