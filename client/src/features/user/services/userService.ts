import { apiClient } from "@/lib/axios";

export interface UpdateProfileInput {
  firstName?: string;
  lastName?: string;
  phone?: string;
  address?: string;
  avatar?: string;
}

export const userService = {
  getProfile: async () => {
    const response = await apiClient.get("/users/profile");
    return response.data;
  },

  updateProfile: async (data: UpdateProfileInput) => {
    const response = await apiClient.put("/users/profile", data);
    return response.data;
  },
};
