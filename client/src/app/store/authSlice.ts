import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { authService } from "@/features/auth/services";

interface ForgotPasswordState {
  step: "email" | "otp" | "newPassword" | "success";
  email: string;
  isLoading: boolean;
  error: string | null;
}

export const sendForgotPasswordOtp = createAsyncThunk(
  "auth/sendForgotPasswordOtp",
  async (email: string, { rejectWithValue }) => {
    try {
      const res = await authService.forgotPassword(email);
      return { email, message: res.message };
    } catch (err: any) {
      return rejectWithValue(err.error || err.message || "Gửi OTP thất bại");
    }
  },
);

export const resetPasswordWithOtp = createAsyncThunk(
  "auth/resetPasswordWithOtp",
  async (
    data: { email: string; otpCode: string; newPassword: string },
    { rejectWithValue },
  ) => {
    try {
      const res = await authService.resetPassword(data);
      return res.message;
    } catch (err: any) {
      return rejectWithValue(
        err.error || err.message || "Đặt lại mật khẩu thất bại",
      );
    }
  },
);

const initialState: ForgotPasswordState = {
  step: "email",
  email: "",
  isLoading: false,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setForgotStep: (
      state,
      action: PayloadAction<ForgotPasswordState["step"]>,
    ) => {
      state.step = action.payload;
    },
    resetForgotFlow: () => initialState,
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // sendForgotPasswordOtp
    builder
      .addCase(sendForgotPasswordOtp.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(sendForgotPasswordOtp.fulfilled, (state, action) => {
        state.isLoading = false;
        state.email = action.payload.email;
        state.step = "otp";
      })
      .addCase(sendForgotPasswordOtp.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // resetPasswordWithOtp
    builder
      .addCase(resetPasswordWithOtp.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(resetPasswordWithOtp.fulfilled, (state) => {
        state.isLoading = false;
        state.step = "success";
      })
      .addCase(resetPasswordWithOtp.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setForgotStep, resetForgotFlow, clearError } = authSlice.actions;
export default authSlice.reducer;
