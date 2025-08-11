import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import toast from "react-hot-toast";

// Get all notifications
export const getNotifications = createAsyncThunk(
  "notifications/getNotifications",
  async (userId, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/v1/notification/get/notification/${userId}`
      );
      return data.notifications;
    } catch (error) {
      console.error(error);
      return rejectWithValue(error.response?.data || "Error fetching notifications");
    }
  }
);

// Update a single notification
export const updateNotification = createAsyncThunk(
  "notifications/updateNotification",
  async ({ id, userId }, { dispatch, rejectWithValue }) => {
    try {
      const { data } = await axios.put(
        `${process.env.REACT_APP_API_URL}/api/v1/notification/update/notification/${id}`
      );
      if (data) {
        dispatch(getNotifications(userId));
        toast.success("Notification updated!");
        localStorage.setItem("notification-sync", Date.now().toString());
      }
      return id;
    } catch (error) {
      console.error(error);
      return rejectWithValue(error.response?.data || "Error updating notification");
    }
  }
);

// Mark all as read
export const updateAllNotification = createAsyncThunk(
  "notifications/updateAllNotification",
  async (userId, { dispatch, rejectWithValue }) => {
    try {
      const { data } = await axios.put(
        `${process.env.REACT_APP_API_URL}/api/v1/notification/marks/all/${userId}`
      );
      if (data) {
        dispatch(getNotifications(userId));
        toast.success("All notifications marked as read!");
        localStorage.setItem("notification-sync", Date.now().toString());
      }
      return true;
    } catch (error) {
      console.error(error);
      return rejectWithValue(error.response?.data || "Error marking all notifications");
    }
  }
);

const notificationSlice = createSlice({
  name: "notifications",
  initialState: {
    notificationData: [],
    loading: false,
    error: null
  },
  reducers: {
    clearNotifications: (state) => {
      state.notificationData = [];
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(getNotifications.pending, (state) => {
        state.loading = true;
      })
      .addCase(getNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.notificationData = action.payload || [];
      })
      .addCase(getNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(updateNotification.fulfilled, (state) => {
        // No direct change, handled by getNotifications
      })
      .addCase(updateAllNotification.fulfilled, (state) => {
        // No direct change, handled by getNotifications
      });
  }
});

export const { clearNotifications } = notificationSlice.actions;
export default notificationSlice.reducer;
