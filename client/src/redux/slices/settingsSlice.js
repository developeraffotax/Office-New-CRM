import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = `${process.env.REACT_APP_API_URL}/api/v1/settings`;

export const getUserSettings = createAsyncThunk(
  "settings/getUserSettings",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(API_URL);
      return data.settings;
    } catch (err) {
      return rejectWithValue(err.response?.data || "Failed to load settings");
    }
  }
);

export const updateUserSettings = createAsyncThunk(
  "settings/updateUserSettings",
  async (updates, { rejectWithValue }) => {
    try {
      const { data } = await axios.put(API_URL, updates);
      return data.settings;
    } catch (err) {
      return rejectWithValue(err.response?.data || "Failed to update settings");
    }
  }
);

const settingsSlice = createSlice({
  name: "settings",
  initialState: {
    settings: null,
    isLoading: false,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getUserSettings.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getUserSettings.fulfilled, (state, action) => {
        state.settings = action.payload;
        state.isLoading = false;
      })
      .addCase(updateUserSettings.fulfilled, (state, action) => {
        state.settings = action.payload;
      });
  },
});

export default settingsSlice.reducer;
