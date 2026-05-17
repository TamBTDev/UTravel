import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { hotelService, Hotel, GetHotelsParams, Destination } from "@/features/hotel/services/hotelService";

interface HotelState {
  featuredHotels: Hotel[];
  destinations: Destination[];
  hotels: Hotel[];
  total: number;
  totalPages: number;
  currentPage: number;
  isLoading: boolean;
  isFeaturedLoading: boolean;
  isDestinationsLoading: boolean;
  error: string | null;
}

const initialState: HotelState = {
  featuredHotels: [],
  destinations: [],
  hotels: [],
  total: 0,
  totalPages: 0,
  currentPage: 1,
  isLoading: false,
  isFeaturedLoading: false,
  isDestinationsLoading: false,
  error: null,
};

export const fetchFeaturedHotels = createAsyncThunk(
  "hotel/fetchFeatured",
  async (limit: number | undefined, { rejectWithValue }) => {
    try {
      const res = await hotelService.getFeaturedHotels(limit);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.error || err.message || "Lỗi khi lấy khách sạn nổi bật");
    }
  }
);

export const fetchHotels = createAsyncThunk(
  "hotel/fetchHotels",
  async (params: GetHotelsParams | undefined, { rejectWithValue }) => {
    try {
      const res = await hotelService.getHotels(params);
      return res;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.error || err.message || "Lỗi khi lấy danh sách khách sạn");
    }
  }
);

export const fetchDestinations = createAsyncThunk(
  "hotel/fetchDestinations",
  async (limit: number | undefined, { rejectWithValue }) => {
    try {
      const res = await hotelService.getDestinations(limit);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.error || err.message || "Lỗi khi lấy danh sách điểm đến");
    }
  }
);

const hotelSlice = createSlice({
  name: "hotel",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // Xử lý fetchFeaturedHotels
    builder
      .addCase(fetchFeaturedHotels.pending, (state) => {
        state.isFeaturedLoading = true;
        state.error = null;
      })
      .addCase(fetchFeaturedHotels.fulfilled, (state, action) => {
        state.isFeaturedLoading = false;
        state.featuredHotels = action.payload;
      })
      .addCase(fetchFeaturedHotels.rejected, (state, action) => {
        state.isFeaturedLoading = false;
        state.error = action.payload as string;
      });

    // Xử lý fetchHotels
    builder
      .addCase(fetchHotels.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchHotels.fulfilled, (state, action) => {
        state.isLoading = false;
        state.hotels = action.payload.data;
        state.total = action.payload.total;
        state.totalPages = action.payload.totalPages;
        state.currentPage = action.payload.page;
      })
      .addCase(fetchHotels.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Xử lý fetchDestinations
    builder
      .addCase(fetchDestinations.pending, (state) => {
        state.isDestinationsLoading = true;
        state.error = null;
      })
      .addCase(fetchDestinations.fulfilled, (state, action) => {
        state.isDestinationsLoading = false;
        state.destinations = action.payload;
      })
      .addCase(fetchDestinations.rejected, (state, action) => {
        state.isDestinationsLoading = false;
        state.error = action.payload as string;
      });
  },
});

export default hotelSlice.reducer;
