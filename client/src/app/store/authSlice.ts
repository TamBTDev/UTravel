import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import {
  authService,
  LoginResponse,
} from "@/features/auth/services/authService";
import { LoginInput, RegisterInput } from "@shared/schemas/auth.schema";

type User = LoginResponse["user"];

interface AuthState {
  // Auth State
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;

  // UI State
  isLoading: boolean;
  error: string | null;

  // Forgot Password Flow
  forgotStep: "email" | "otp" | "newPassword" | "success";
  forgotEmail: string;

  // Registration Flow (Temporary storage for verify OTP)
  tempUserId: number | null;
}

// --- Async Thunks ---

export const login = createAsyncThunk(
  "auth/login",
  async (credentials: LoginInput, { rejectWithValue }) => {
    try {
      const res = await authService.login(credentials);
      localStorage.setItem("user", JSON.stringify(res.user));
      localStorage.setItem("token", res.token);
      return res;
    } catch (err: any) {
      return rejectWithValue(err.error || err.message || "Đăng nhập thất bại");
    }
  },
);

export const register = createAsyncThunk(
  "auth/register",
  async (data: RegisterInput, { rejectWithValue }) => {
    try {
      const res = await authService.register(data);
      return res.data; // Trả về { userId, email }
    } catch (err: any) {
      return rejectWithValue(err.error || err.message || "Đăng ký thất bại");
    }
  },
);

export const verifyOtp = createAsyncThunk(
  "auth/verifyOtp",
  async (data: { userId: number; otpCode: string }, { rejectWithValue }) => {
    try {
      const res = await authService.verifyOtp(data);
      localStorage.setItem("user", JSON.stringify(res.user));
      return res;
    } catch (err: any) {
      return rejectWithValue(err.error || err.message || "Xác thực thất bại");
    }
  },
);

export const resendOtp = createAsyncThunk(
  "auth/resendOtp",
  async (userId: number, { rejectWithValue }) => {
    try {
      const res = await authService.resendOtp(userId);
      return res.message;
    } catch (err: any) {
      return rejectWithValue(
        err.error || err.message || "Gửi lại OTP thất bại",
      );
    }
  },
);

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

// --- Slice ---

const storedUser = localStorage.getItem("user");
const storedToken = localStorage.getItem("token");

const initialState: AuthState = {
  user: storedUser ? JSON.parse(storedUser) : null,
  token: storedToken || null,
  isAuthenticated: !!storedToken,
  isLoading: false,
  error: null,
  forgotStep: "email",
  forgotEmail: "",
  tempUserId: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setForgotStep: (state, action: PayloadAction<AuthState["forgotStep"]>) => {
      state.forgotStep = action.payload;
    },
    resetForgotFlow: (state) => {
      state.forgotStep = "email";
      state.forgotEmail = "";
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    logout: (state) => {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Register
      .addCase(register.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.isLoading = false;
        state.tempUserId = action.payload.userId;
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Verify OTP
      .addCase(verifyOtp.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(verifyOtp.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.isAuthenticated = true;
      })
      .addCase(verifyOtp.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Resend OTP
      .addCase(resendOtp.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(resendOtp.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(resendOtp.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Forgot Password OTP
      .addCase(sendForgotPasswordOtp.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(sendForgotPasswordOtp.fulfilled, (state, action) => {
        state.isLoading = false;
        state.forgotEmail = action.payload.email;
        state.forgotStep = "otp";
      })
      .addCase(sendForgotPasswordOtp.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Reset Password
      .addCase(resetPasswordWithOtp.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(resetPasswordWithOtp.fulfilled, (state) => {
        state.isLoading = false;
        state.forgotStep = "success";
      })
      .addCase(resetPasswordWithOtp.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setForgotStep, resetForgotFlow, clearError, logout } =
  authSlice.actions;
export default authSlice.reducer;
