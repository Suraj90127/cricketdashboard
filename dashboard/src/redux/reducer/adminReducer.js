import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../api";

/**
 * Update WhatsApp Number (Single Admin)
 */
export const updateWhatsappNumber = createAsyncThunk(
  "admin/updateWhatsappNumber",
  async ({ wnumber }, { rejectWithValue }) => {
    console.log("wnumber in thunk:", wnumber);
    
    try {
      const res = await api.get(
        `/add-whatsapp`,
        {
          params: { wnumber },
          withCredentials: true,
        }
      );
      return res.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "Update failed" }
      );
    }
  }
);

const initialState = {
  loading: false,
  updating: false,
  adminData: null,
  errorMessage: "",
  successMessage: "",
};

const adminSlice = createSlice({
  name: "admin",
  initialState,
  reducers: {
    messageClear: (state) => {
      state.errorMessage = "";
      state.successMessage = "";
    },
    clearError: (state) => {
      state.errorMessage = "";
    },
  },
  extraReducers: (builder) => {
    builder
      // 🔄 Update WhatsApp
      .addCase(updateWhatsappNumber.pending, (state) => {
        state.updating = true;
        state.errorMessage = "";
        state.successMessage = "";
      })
      .addCase(updateWhatsappNumber.fulfilled, (state, action) => {
        state.updating = false;
        state.adminData = action.payload.data;
        state.successMessage = "WhatsApp number updated successfully";
      })
      .addCase(updateWhatsappNumber.rejected, (state, action) => {
        state.updating = false;
        state.errorMessage =
          action.payload?.message || "Failed to update WhatsApp number";
      });
  },
});

export const { messageClear, clearError } = adminSlice.actions;
export default adminSlice.reducer;
