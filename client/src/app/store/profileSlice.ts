import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import {
  userService,
  UpdateProfileInput,
} from "@/features/user/services/userService";

export interface UserProfile {
  id: number;
  email: string;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  address: string | null;
  avatar: string | null;
  role: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface ProfileState {
  profile: UserProfile | null;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  successMessage: string | null;
}

export const fetchProfile = createAsyncThunk(
  "profile/fetchProfile",
  async (_, { rejectWithValue }) => {
    try {
      const res = await userService.getProfile();
      return res.data as UserProfile;
    } catch (err: any) {
      const message = err.response?.data?.error || err.message || "Không thể tải hồ sơ";
      return rejectWithValue(message);
    }
  },
);

export const updateProfile = createAsyncThunk(
  "profile/updateProfile",
  async (data: UpdateProfileInput, { rejectWithValue }) => {
    try {
      const res = await userService.updateProfile(data);
      return res.data as UserProfile;
    } catch (err: any) {
      const message =
        err.response?.data?.details?.[0]?.message ||
        err.response?.data?.error ||
        err.message ||
        "Cập nhật thất bại";
      return rejectWithValue(message);
    }
  },
);

const initialState: ProfileState = {
  profile: null,
  isLoading: false,
  isSaving: false,
  error: null,
  successMessage: null,
};

const profileSlice = createSlice({
  name: "profile",
  initialState,
  reducers: {
    clearProfileMessages: (state) => {
      state.error = null;
      state.successMessage = null;
    },
    clearProfile: () => initialState,
  },
  extraReducers: (builder) => {
    // fetchProfile
    builder
      .addCase(fetchProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        fetchProfile.fulfilled,
        (state, action: PayloadAction<UserProfile>) => {
          state.isLoading = false;
          state.profile = action.payload;
        },
      )
      .addCase(fetchProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // updateProfile
    builder
      .addCase(updateProfile.pending, (state) => {
        state.isSaving = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(
        updateProfile.fulfilled,
        (state, action: PayloadAction<UserProfile>) => {
          state.isSaving = false;
          state.profile = action.payload;
          state.successMessage = "Cập nhật hồ sơ thành công!";
        },
      )
      .addCase(updateProfile.rejected, (state, action) => {
        state.isSaving = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearProfileMessages, clearProfile } = profileSlice.actions;
export default profileSlice.reducer;
