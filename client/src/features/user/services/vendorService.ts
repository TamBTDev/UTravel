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
};
