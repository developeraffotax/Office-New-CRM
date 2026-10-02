import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { fetchMySheetsApi } from "../../services/googlesheetService";

export const fetchMySheets = createAsyncThunk(
  "googleSheets/fetchMine",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await fetchMySheetsApi();
      return data.sheets || [];
    } catch (err) {
      return rejectWithValue(
        err?.response?.data?.message || "Failed to load sheets",
      );
    }
  },
);

const googleSheetSlice = createSlice({
  name: "googleSheets",
  initialState: { items: [], loading: false, error: null },
  reducers: {
    clearSheets: (state) => {
      state.items = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMySheets.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMySheets.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchMySheets.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearSheets } = googleSheetSlice.actions;
export default googleSheetSlice.reducer;