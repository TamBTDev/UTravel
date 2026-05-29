import { apiClient } from "@/lib/axios";

export interface AdminStats {
  totalUsers: number;
  totalVendors: number;
  totalHotels: number;
  totalBookings: number;
  totalRevenue: number;
}

export interface PendingVendor {
  id: number;
  userId: number;
  shopName: string;
  description: string | null;
  businessLicense: string | null;
  bankName: string;
  bankOwner: string;
  bankAccount: string;
  status: string;
  createdAt: string;
  user: {
    email: string;
    firstName: string;
    lastName: string;
    phone: string;
  };
}

export interface PendingHotel {
  id: number;
  name: string;
  description: string;
  location: string;
  city: string;
  country: string;
  rating: number;
  images: string;
  amenities: string;
  approvalStatus: string;
  createdAt: string;
  vendor: {
    shopName: string;
  };
}

export interface AdminUser {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  role: string;
  status: string;
  createdAt: string;
  _count: {
    bookings: number;
    reviews: number;
  };
}

export const adminService = {
  getAdminStats: async (): Promise<{ success: boolean; data: AdminStats }> => {
    try {
      const res = await apiClient.get("/admin/dashboard");
      return res.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  },

  getPendingVendors: async (): Promise<{ success: boolean; data: PendingVendor[] }> => {
    try {
      const res = await apiClient.get("/admin/vendors/pending");
      return res.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  },

  updateVendorStatus: async (vendorId: number, status: "APPROVED" | "REJECTED"): Promise<{ success: boolean; message: string }> => {
    try {
      const res = await apiClient.patch(`/admin/vendors/${vendorId}/status`, { status });
      return res.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  },

  getPendingHotels: async (): Promise<{ success: boolean; data: PendingHotel[] }> => {
    try {
      const res = await apiClient.get("/admin/hotels/pending");
      return res.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  },

  updateHotelStatus: async (hotelId: number, status: "APPROVED" | "REJECTED", rejectReason?: string): Promise<{ success: boolean; message: string }> => {
    try {
      const res = await apiClient.patch(`/admin/hotels/${hotelId}/status`, { status, rejectReason });
      return res.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  },

  getAllUsers: async (search?: string, role?: string, status?: string): Promise<{ success: boolean; data: AdminUser[] }> => {
    try {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (role) params.append("role", role);
      if (status) params.append("status", status);
      const res = await apiClient.get(`/admin/users?${params.toString()}`);
      return res.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  },

  updateUserStatus: async (userId: number, status: "VERIFIED" | "SUSPENDED"): Promise<{ success: boolean; message: string }> => {
    try {
      const res = await apiClient.patch(`/admin/users/${userId}/status`, { status });
      return res.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  },
};
