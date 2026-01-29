import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../api";

export const userWithdrawal = createAsyncThunk(
  "wallet/userWithdrawal",
  async ({ page = 1, limit = 20, status, search, sortBy = 'createdAt', order = 'desc' }, { rejectWithValue }) => {
    try {
      let query = `page=${page}&limit=${limit}`;
      if (status && status !== 'all') query += `&status=${status}`;
      if (search) query += `&search=${search}`;
      if (sortBy) query += `&sortBy=${sortBy}`;
      if (order) query += `&order=${order}`;

      const res = await api.get(`/user/withdrawals-list?${query}`, {
        withCredentials: true,
      });
      return res.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "Fetch failed" }
      );
    }
  }
);

export const updateWithdrawalStatus = createAsyncThunk(
  "wallet/updateWithdrawalStatus",
  async ({ withdrawalId, status }, { rejectWithValue }) => {
    try {
      const res = await api.put(`/user-withdrawals/status`, {withdrawalId, status }, {
        withCredentials: true,
      });
      return res.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "Update failed" }
      );
    }
  }
);

const initialState = {
  message: null,
  errorMessage: null,
  successMessage: null,
  loading: false,
  updating: false,
  windrowalData: [],
  pagination: {
    page: 1,
    perPage: 20,
    total: 0,
    totalPages: 1
  }
};

const walletSlice = createSlice({
  name: "wallet",
  initialState,
  reducers: {
    messageClear: (state) => {
      state.errorMessage = "";
      state.successMessage = "";
    },
    clearError: (state) => {
      state.error = null;
    },
    setCurrentPage: (state, action) => {
      state.pagination.page = action.payload;
    },
    setPagination: (state, action) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    setWithdrawals: (state, action) => {
      state.windrowalData = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch withdrawals
      .addCase(userWithdrawal.fulfilled, (state, action) => {
        state.loading = false;
        state.windrowalData = action.payload.data;
        state.pagination = action.payload.meta;
      })
      .addCase(userWithdrawal.rejected, (state, action) => {
        state.loading = false;
        state.errorMessage = action.payload?.message || "Failed to fetch withdrawals";
      })
      .addCase(userWithdrawal.pending, (state) => {
        state.loading = true;
        state.errorMessage = "";
        state.successMessage = "";
      })

      // Update status
      .addCase(updateWithdrawalStatus.fulfilled, (state, action) => {
        state.updating = false;
        state.successMessage = "Status updated successfully";
        // Update local state
        const updatedWithdrawal = action.payload.data;
        state.windrowalData = state.windrowalData.map(w => 
          w._id === updatedWithdrawal._id ? updatedWithdrawal : w
        );
      })
      .addCase(updateWithdrawalStatus.rejected, (state, action) => {
        state.updating = false;
        state.errorMessage = action.payload?.message || "Failed to update status";
      })
      .addCase(updateWithdrawalStatus.pending, (state) => {
        state.updating = true;
        state.errorMessage = "";
        state.successMessage = "";
      });
  },
});

export const { clearError, setCurrentPage, setPagination, setWithdrawals, messageClear } = walletSlice.actions;

export default walletSlice.reducer;