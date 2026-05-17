import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { createBooking, getMyBookings } from '@/features/booking/services/bookingService';
import type { CreateBookingData } from '@/features/booking/services/bookingService';

export interface Booking {
  id: string;
  userId: string;
  roomId: string;
  checkInDate: string;
  checkOutDate: string;
  numberOfGuests: number;
  specialRequests: string;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  paymentStatus: 'unpaid' | 'paid';
  createdAt: string;
  room?: any;
  payment?: any;
}

interface BookingState {
  currentBooking: Booking | null;
  myBookings: Booking[];
  isLoading: boolean;
  error: string | null;
  success: boolean;
}

const initialState: BookingState = {
  currentBooking: null,
  myBookings: [],
  isLoading: false,
  error: null,
  success: false,
};

// Async thunks
export const createBookingThunk = createAsyncThunk(
  'booking/create',
  async (data: CreateBookingData, { rejectWithValue }) => {
    try {
      const result = await createBooking(data);
      return result;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create booking');
    }
  }
);

export const fetchMyBookings = createAsyncThunk(
  'booking/getMyBookings',
  async (_, { rejectWithValue }) => {
    try {
      const result = await getMyBookings();
      return result;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch bookings');
    }
  }
);

const bookingSlice = createSlice({
  name: 'booking',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.success = false;
    },
    clearCurrentBooking: (state) => {
      state.currentBooking = null;
    },
  },
  extraReducers: (builder) => {
    // Create Booking
    builder
      .addCase(createBookingThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createBookingThunk.fulfilled, (state, action: PayloadAction<Booking>) => {
        state.isLoading = false;
        state.currentBooking = action.payload;
        state.success = true;
      })
      .addCase(createBookingThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.success = false;
      });

    // Fetch My Bookings
    builder
      .addCase(fetchMyBookings.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMyBookings.fulfilled, (state, action: PayloadAction<Booking[]>) => {
        state.isLoading = false;
        state.myBookings = action.payload;
      })
      .addCase(fetchMyBookings.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, clearSuccess, clearCurrentBooking } = bookingSlice.actions;
export default bookingSlice.reducer;
